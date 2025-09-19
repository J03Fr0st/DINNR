import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of } from 'rxjs';

/**
 * Custom preloading strategy that loads routes after a short delay
 * to prioritize initial page load performance
 */
@Injectable({
  providedIn: 'root'
})
export class SmartPreloadingStrategy implements PreloadingStrategy {
  private loadedModules = new Set<string>();
  private preloadedModules = new Set<string>();

  preload(route: Route, load: () => Observable<any>): Observable<any> {
    if (route.data?.['preload'] && route.path) {
      // Add a small delay to not block initial rendering
      return new Observable(observer => {
        const timeoutId = setTimeout(() => {
          load().subscribe({
            next: module => {
              if (route.path) {
                this.loadedModules.add(route.path);
                this.preloadedModules.add(route.path);
                console.log(`[Preloading] Successfully preloaded: ${route.path}`);
              }
              observer.next(module);
              observer.complete();
            },
            error: err => {
              if (route.path) {
                console.error(`[Preloading] Failed to preload: ${route.path}`, err);
              }
              observer.error(err);
            }
          });
        }, 2000); // 2 second delay

        return () => clearTimeout(timeoutId);
      });
    }

    return of(null);
  }

  /**
   * Get list of preloaded modules
   */
  getPreloadedModules(): string[] {
    return Array.from(this.preloadedModules);
  }

  /**
   * Check if a specific module is preloaded
   */
  isModulePreloaded(path: string): boolean {
    return this.preloadedModules.has(path);
  }

  /**
   * Force preload a specific route
   */
  forcePreload(routePath: string, loadFn: () => Observable<any>): void {
    if (!this.isModulePreloaded(routePath)) {
      loadFn().subscribe({
        next: () => {
          this.preloadedModules.add(routePath);
          console.log(`[Force Preloading] Successfully preloaded: ${routePath}`);
        },
        error: err => {
          console.error(`[Force Preloading] Failed to preload: ${routePath}`, err);
        }
      });
    }
  }
}