import { Injectable } from '@angular/core';
import { Observable, of, throwError, forkJoin } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PubgClient } from '@j03fr0st/pubg-ts';
import { Player, Match, TelemetryEvent, Shard as ApiShard } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PubgApiService {
  private readonly pubgClient: PubgClient;
  private readonly cache = new Map<string, { data: any; timestamp: number }>();
  private readonly cacheTtl = environment.cacheTtl;

  constructor() {
    this.pubgClient = new PubgClient({
      apiKey: environment.pubgApiKey,
      shard: 'steam'
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

  getPlayerByName(playerName: string): Observable<Player> {
    const cacheKey = this.getCacheKey(`player-${playerName}`);
    const cached = this.getFromCache<Player>(cacheKey);
    if (cached) {
      return of(cached);
    }

    return new Observable(observer => {
      this.pubgClient.players.getPlayerByName(playerName)
        .then(response => {
          if (response.data && response.data.length > 0) {
            const player = response.data[0];
            this.setCache(cacheKey, player);
            observer.next(player);
            observer.complete();
          } else {
            observer.error(new Error(`Player '${playerName}' not found`));
          }
        })
        .catch(error => {
          console.error('Error fetching player:', error);
          observer.error(new Error(`Failed to fetch player '${playerName}': ${error.message}`));
        });
    });
  }

  getMatch(matchId: string): Observable<Match> {
    const cacheKey = this.getCacheKey(`match-${matchId}`);
    const cached = this.getFromCache<Match>(cacheKey);
    if (cached) {
      return of(cached);
    }

    return new Observable(observer => {
      this.pubgClient.matches.getMatch(matchId)
        .then(response => {
          const match = response.data;
          this.setCache(cacheKey, match);
          observer.next(match);
          observer.complete();
        })
        .catch(error => {
          console.error('Error fetching match:', error);
          observer.error(new Error(`Failed to fetch match '${matchId}': ${error.message}`));
        });
    });
  }

  getTelemetry(telemetryUrl: string): Observable<TelemetryEvent[]> {
    const cacheKey = this.getCacheKey(`telemetry-${telemetryUrl}`);
    const cached = this.getFromCache<TelemetryEvent[]>(cacheKey);
    if (cached) {
      return of(cached);
    }

    return new Observable(observer => {
      this.pubgClient.telemetry.getTelemetryData(telemetryUrl)
        .then(events => {
          this.setCache(cacheKey, events);
          observer.next(events);
          observer.complete();
        })
        .catch(error => {
          console.error('Error fetching telemetry:', error);
          observer.error(new Error(`Failed to fetch telemetry: ${error.message}`));
        });
    });
  }

  getPlayerMatches(playerId: string): Observable<Match[]> {
    const cacheKey = this.getCacheKey(`player-matches-${playerId}`);
    const cached = this.getFromCache<Match[]>(cacheKey);
    if (cached) {
      return of(cached);
    }

    return new Observable(observer => {
      // First get the player by ID to access their match relationships
      this.pubgClient.players.getPlayerById(playerId)
        .then(playerResponse => {
          const player = playerResponse.data[0] || playerResponse.data;

          // Extract match IDs from player relationships
          const matchIds = player.relationships?.matches?.data?.map((match: any) => match.id) || [];

          if (matchIds.length === 0) {
            this.setCache(cacheKey, []);
            observer.next([]);
            observer.complete();
            return;
          }

          // Fetch all matches in parallel (limit to recent 10 for performance)
          const recentMatchIds = matchIds.slice(0, 10);
          const matchPromises = recentMatchIds.map((matchId: string) =>
            this.pubgClient.matches.getMatch(matchId)
              .then(matchResponse => matchResponse.data)
              .catch(error => {
                console.warn(`Failed to fetch match ${matchId}:`, error);
                return null; // Return null for failed matches
              })
          );

          Promise.all(matchPromises)
            .then((matches: (Match | null)[]) => {
              const validMatches = matches.filter((match: Match | null) => match !== null) as Match[];
              this.setCache(cacheKey, validMatches);
              observer.next(validMatches);
              observer.complete();
            })
            .catch(error => {
              console.error('Error fetching matches:', error);
              observer.error(new Error(`Failed to fetch matches: ${error.message}`));
            });
        })
        .catch(error => {
          console.error('Error fetching player matches:', error);
          observer.error(new Error(`Failed to fetch player matches: ${error.message}`));
        });
    });
  }

  getPlayerSeasonStats(playerId: string, seasonId: string): Observable<any> {
    const cacheKey = this.getCacheKey(`player-season-stats-${playerId}-${seasonId}`);
    const cached = this.getFromCache<any>(cacheKey);
    if (cached) {
      return of(cached);
    }

    return new Observable(observer => {
      this.pubgClient.players.getPlayerSeasonStats({ playerId, seasonId })
        .then(stats => {
          this.setCache(cacheKey, stats);
          observer.next(stats);
          observer.complete();
        })
        .catch(error => {
          console.error('Error fetching player season stats:', error);
          observer.error(new Error(`Failed to fetch player season stats: ${error.message}`));
        });
    });
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
}
