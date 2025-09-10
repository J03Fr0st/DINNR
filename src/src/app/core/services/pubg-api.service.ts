import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError, forkJoin, switchMap } from 'rxjs';
import { map, catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Player, Match, TelemetryEvent, Shard as ApiShard } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PubgApiService {
  private readonly baseUrl = environment.apiBaseUrl || 'https://api.pubg.com';
  private readonly apiKey = environment.pubgApiKey;
  private readonly cache = new Map<string, { data: any; timestamp: number }>();
  private readonly cacheTtl = environment.cacheTtl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.apiKey}`,
      'Accept': 'application/vnd.api+json'
    });
  }

  private getCacheKey(endpoint: string, params: any = {}): string {
    return `${endpoint}-${JSON.stringify(params)}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTtl) {
      return cached.data as T;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  getPlayerByName(playerName: string, shard: ApiShard = 'pc-na' as ApiShard): Observable<Player> {
    const cacheKey = this.getCacheKey(`player-${playerName}`, { shard });
    const cached = this.getFromCache<Player>(cacheKey);
    if (cached) {
      return of(cached);
    }

    const url = `${this.baseUrl}/shards/${shard}/players?filter[playerNames]=${encodeURIComponent(playerName)}`;
    
    return this.http.get<{ data: Player[] }>(url, { headers: this.getHeaders() }).pipe(
      retry(2),
      map(response => {
        if (response.data && response.data.length > 0) {
          const player = response.data[0];
          this.setCache(cacheKey, player);
          return player;
        }
        throw new Error(`Player '${playerName}' not found`);
      }),
      catchError(error => {
        console.error('Error fetching player:', error);
        return throwError(() => new Error(`Failed to fetch player '${playerName}': ${error.message}`));
      })
    );
  }

  getMatch(matchId: string, shard: ApiShard = 'pc-na' as ApiShard): Observable<Match> {
    const cacheKey = this.getCacheKey(`match-${matchId}`, { shard });
    const cached = this.getFromCache<Match>(cacheKey);
    if (cached) {
      return of(cached);
    }

    const url = `${this.baseUrl}/shards/${shard}/matches/${matchId}`;
    
    return this.http.get<{ data: Match }>(url, { headers: this.getHeaders() }).pipe(
      retry(2),
      map(response => response.data),
      map(match => {
        this.setCache(cacheKey, match);
        return match;
      }),
      catchError(error => {
        console.error('Error fetching match:', error);
        return throwError(() => new Error(`Failed to fetch match '${matchId}': ${error.message}`));
      })
    );
  }

  getTelemetry(telemetryUrl: string): Observable<TelemetryEvent[]> {
    const cacheKey = this.getCacheKey(`telemetry-${telemetryUrl}`);
    const cached = this.getFromCache<TelemetryEvent[]>(cacheKey);
    if (cached) {
      return of(cached);
    }

    return this.http.get<TelemetryEvent[]>(telemetryUrl).pipe(
      retry(2),
      map(events => {
        this.setCache(cacheKey, events);
        return events;
      }),
      catchError(error => {
        console.error('Error fetching telemetry:', error);
        return throwError(() => new Error(`Failed to fetch telemetry: ${error.message}`));
      })
    );
  }

  getPlayerMatches(playerId: string, shard: ApiShard = 'pc-na' as ApiShard): Observable<Match[]> {
    const cacheKey = this.getCacheKey(`player-matches-${playerId}`, { shard });
    const cached = this.getFromCache<Match[]>(cacheKey);
    if (cached) {
      return of(cached);
    }

    return this.getPlayerByAccountId(playerId, shard).pipe(
      switchMap(player => {
        const matchIds = player.relationships?.matches?.data.map(m => m.id) || [];
        const matchObservables = matchIds.map(matchId => this.getMatch(matchId, shard));
        return forkJoin(matchObservables);
      }),
      map(matches => {
        this.setCache(cacheKey, matches);
        return matches;
      }),
      catchError(error => {
        console.error('Error fetching player matches:', error);
        return throwError(() => new Error(`Failed to fetch player matches: ${error.message}`));
      })
    );
  }

  getPlayerSeasonStats(playerId: string, seasonId: string, shard: ApiShard = 'pc-na' as ApiShard): Observable<any> {
    const cacheKey = this.getCacheKey(`player-season-stats-${playerId}-${seasonId}`, { shard });
    const cached = this.getFromCache<any>(cacheKey);
    if (cached) {
      return of(cached);
    }

    const url = `${this.baseUrl}/shards/${shard}/players/${playerId}/seasons/${seasonId}`;
    
    return this.http.get<any>(url, { headers: this.getHeaders() }).pipe(
      retry(2),
      map(stats => {
        this.setCache(cacheKey, stats);
        return stats;
      }),
      catchError(error => {
        console.error('Error fetching player season stats:', error);
        return throwError(() => new Error(`Failed to fetch player season stats: ${error.message}`));
      })
    );
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  private getPlayerByAccountId(playerId: string, shard: ApiShard): Observable<Player> {
    const url = `${this.baseUrl}/shards/${shard}/players/${playerId}`;
    
    return this.http.get<{ data: Player }>(url, { headers: this.getHeaders() }).pipe(
      retry(2),
      map(response => response.data),
      catchError(error => {
        console.error('Error fetching player by account ID:', error);
        return throwError(() => new Error(`Failed to fetch player by account ID: ${error.message}`));
      })
    );
  }
}