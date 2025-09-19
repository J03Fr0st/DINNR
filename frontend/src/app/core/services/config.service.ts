import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface AppConfig {
  apiUrl: string;
  pubgApi: {
    baseUrl: string;
    shard: string;
  };
  cache: {
    ttl: number;
    maxSize: number;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableConsole: boolean;
  };
  features: {
    enableTelemetry: boolean;
    enableAdvancedAnalytics: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService implements OnDestroy {
  private configSubject = new BehaviorSubject<AppConfig | null>(null);
  private readonly STORAGE_KEY = 'dinnr_config';
  private readonly CONFIG_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private refreshTimer: number | null = null;

  public config$ = this.configSubject.asObservable();
  public configLoaded$ = this.configSubject.pipe(map(config => config !== null));

  constructor(private http: HttpClient) {
    this.loadConfig();
    this.startPeriodicRefresh();
  }

  ngOnDestroy(): void {
    this.stopPeriodicRefresh();
  }

  /**
   * Get current configuration synchronously
   */
  get config(): AppConfig | null {
    return this.configSubject.value;
  }

  /**
   * Get configuration value as observable
   */
  getConfig$(): Observable<AppConfig> {
    return this.configSubject.pipe(
      map(config => {
        if (!config) {
          throw new Error('Configuration not loaded');
        }
        return config;
      })
    );
  }

  /**
   * Get specific configuration value
   */
  getConfigValue<T extends keyof AppConfig>(key: T): AppConfig[T] | null {
    const config = this.configSubject.value;
    return config ? config[key] : null;
  }

  /**
   * Check if configuration is loaded
   */
  isConfigLoaded(): boolean {
    return this.configSubject.value !== null;
  }

  /**
   * Refresh configuration from server
   */
  refreshConfig(): Observable<AppConfig> {
    if (environment.production) {
      return this.http.get<AppConfig>('/api/config').pipe(
        tap(config => {
          this.validateConfig(config);
          this.configSubject.next(config);
          this.cacheConfig(config);
        }),
        catchError(error => {
          console.error('Failed to refresh configuration:', error);
          // Return cached config if available
          const cached = this.getCachedConfig();
          if (cached) {
            this.configSubject.next(cached);
            return of(cached);
          }
          throw error;
        })
      );
    } else {
      // In development, use environment configuration
      const devConfig: AppConfig = {
        apiUrl: environment.apiUrl || 'http://localhost:4200/api',
        pubgApi: {
          baseUrl: 'https://api.pubg.com',
          shard: environment.shard || 'steam'
        },
        cache: {
          ttl: environment.cacheTtl || 3600000,
          maxSize: 100
        },
        logging: {
          level: 'debug',
          enableConsole: true
        },
        features: {
          enableTelemetry: true,
          enableAdvancedAnalytics: true
        }
      };

      this.validateConfig(devConfig);
      this.configSubject.next(devConfig);
      return of(devConfig);
    }
  }

  /**
   * Load initial configuration
   */
  private loadConfig(): void {
    // Try to load from cache first
    const cached = this.getCachedConfig();
    if (cached) {
      this.configSubject.next(cached);
    }

    // Always refresh from source
    this.refreshConfig().subscribe({
      error: (error) => {
        console.error('Failed to load initial configuration:', error);
        if (!cached) {
          // Fallback to default configuration
          this.configSubject.next(this.getDefaultConfig());
        }
      }
    });
  }

  /**
   * Get cached configuration from sessionStorage
   */
  private getCachedConfig(): AppConfig | null {
    try {
      const cached = sessionStorage.getItem(this.STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Check if cache is still valid (less than 1 hour old)
        const age = Date.now() - parsed.timestamp;
        if (age < 3600000) { // 1 hour
          return parsed.config;
        }
      }
    } catch (error) {
      console.warn('Failed to read cached configuration:', error);
    }
    return null;
  }

  /**
   * Cache configuration in sessionStorage
   */
  private cacheConfig(config: AppConfig): void {
    try {
      const cacheEntry = {
        config,
        timestamp: Date.now()
      };
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(cacheEntry));
    } catch (error) {
      console.warn('Failed to cache configuration:', error);
    }
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): AppConfig {
    return {
      apiUrl: 'http://localhost:4200/api',
      pubgApi: {
        baseUrl: 'https://api.pubg.com',
        shard: 'steam'
      },
      cache: {
        ttl: 3600000,
        maxSize: 50
      },
      logging: {
        level: 'info',
        enableConsole: true
      },
      features: {
        enableTelemetry: true,
        enableAdvancedAnalytics: false
      }
    };
  }

  /**
   * Validate configuration structure
   */
  private validateConfig(config: any): void {
    const requiredFields = ['apiUrl', 'pubgApi', 'cache', 'logging', 'features'];
    const missingFields = requiredFields.filter(field => !(field in config));

    if (missingFields.length > 0) {
      throw new Error(`Invalid configuration: missing fields ${missingFields.join(', ')}`);
    }

    // Validate pubgApi structure
    if (!config.pubgApi.baseUrl || !config.pubgApi.shard) {
      throw new Error('Invalid pubgApi configuration');
    }

    // Validate cache structure
    if (typeof config.cache.ttl !== 'number' || typeof config.cache.maxSize !== 'number') {
      throw new Error('Invalid cache configuration');
    }
  }

  /**
   * Start periodic configuration refresh
   */
  private startPeriodicRefresh(): void {
    if (environment.production) {
      this.refreshTimer = window.setInterval(() => {
        this.refreshConfig().subscribe();
      }, this.CONFIG_REFRESH_INTERVAL);
    }
  }

  /**
   * Stop periodic configuration refresh
   */
  private stopPeriodicRefresh(): void {
    if (this.refreshTimer) {
      window.clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Clear cached configuration
   */
  clearCache(): void {
    try {
      sessionStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear configuration cache:', error);
    }
  }
}