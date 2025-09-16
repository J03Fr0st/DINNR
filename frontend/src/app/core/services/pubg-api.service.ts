import { Injectable } from "@angular/core";
import { PubgClient } from "@j03fr0st/pubg-ts";
import { Observable, forkJoin, of, throwError } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { Shard as ApiShard, type Match, MatchResponse, type Player, type TelemetryEvent } from "../models";

@Injectable({
  providedIn: "root",
})
export class PubgApiService {
  private readonly pubgClient: PubgClient;
  private readonly cache = new Map<string, { data: unknown; timestamp: number }>();
  private readonly cacheTtl = environment.cacheTtl;

  constructor() {
    if (!environment.pubgApiKey) {
      console.warn("PUBG API key not configured. API calls will fail.");
    }

    this.pubgClient = new PubgClient({
      apiKey: environment.pubgApiKey || "dummy-key",
      shard: "steam",
    });
  }

  private getCacheKey(endpoint: string, params: Record<string, unknown> = {}): string {
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

  private setCache(key: string, data: unknown): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  getPlayerByName(playerName: string): Observable<Player> {
    const cacheKey = this.getCacheKey(`player-${playerName}`);
    const cached = this.getFromCache<Player>(cacheKey);
    if (cached) {
      return of(cached);
    }

    return new Observable((observer) => {
      this.pubgClient.players
        .getPlayerByName(playerName)
        .then((response) => {
          if (response.data && response.data.length > 0) {
            const player = response.data[0];
            this.setCache(cacheKey, player);
            observer.next(player);
            observer.complete();
          } else {
            observer.error(new Error(`Player '${playerName}' not found`));
          }
        })
        .catch((error) => {
          console.error("Error fetching player:", error);
          observer.error(new Error(`Failed to fetch player '${playerName}': ${error.message}`));
        });
    });
  }

  getMatch(matchId: string): Observable<MatchResponse> {
    // Check if API key is configured
    if (!environment.pubgApiKey) {
      return throwError(() => new Error(
        'PUBG API key not configured. Please set the PUBG_API_KEY environment variable to use real match data.'
      ));
    }

    const cacheKey = this.getCacheKey(`match-${matchId}`);
    const cached = this.getFromCache<MatchResponse>(cacheKey);
    if (cached) {
      return of(cached);
    }

    return new Observable((observer) => {
      this.pubgClient.matches
        .getMatch(matchId)
        .then((response) => {
          // Return the full response, not just response.data
          this.setCache(cacheKey, response);
          observer.next(response);
          observer.complete();
        })
        .catch((error) => {
          console.error("Error fetching match:", error);
          let errorMessage = `Failed to fetch match '${matchId}': ${error.message}`;

          if (error.message?.includes('404') || error.message?.includes('Not Found')) {
            errorMessage = `Match '${matchId}' not found. Please verify the match ID is correct.`;
          } else if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
            errorMessage = 'PUBG API authentication failed. Please check your API key.';
          } else if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
            errorMessage = 'Access forbidden. Your API key may not have the required permissions.';
          }

          observer.error(new Error(errorMessage));
        });
    });
  }

  getTelemetry(telemetryUrl: string): Observable<TelemetryEvent[]> {
    // Check if API key is configured
    if (!environment.pubgApiKey) {
      return throwError(() => new Error(
        'PUBG API key not configured. Please set the PUBG_API_KEY environment variable to use real telemetry data.'
      ));
    }

    const cacheKey = this.getCacheKey(`telemetry-${telemetryUrl}`);
    const cached = this.getFromCache<TelemetryEvent[]>(cacheKey);
    if (cached) {
      return of(cached);
    }

    return new Observable((observer) => {
      this.pubgClient.telemetry
        .getTelemetryData(telemetryUrl)
        .then((events: unknown) => {
          console.log("PubgApiService.getTelemetry - Raw response:", {
            url: telemetryUrl,
            responseType: typeof events,
            isArray: Array.isArray(events),
            length: Array.isArray(events) ? events.length : 'N/A',
            firstEventSample: Array.isArray(events) && events.length > 0 ? events[0] : 'No events'
          });

          // Validate that it's not an HTML error response first
          if (typeof events === 'string') {
            if (events.includes('<!doctype html>')) {
              throw new Error('Received HTML error response instead of telemetry data');
            }
            throw new Error('Invalid telemetry data format. Expected array, got string');
          }

          // Validate that the response is actually an array of telemetry events
          if (!Array.isArray(events)) {
            const errorMsg = `Invalid telemetry data format. Expected array, got: ${typeof events}`;
            console.error(errorMsg, events);
            throw new Error(errorMsg);
          }

          // Additional validation: check if we have any data at all
          if (events.length === 0) {
            console.warn('Telemetry data is empty for URL:', telemetryUrl);
          }

          // Validate that events have the expected structure
          if (events.length > 0 && !(events[0] as any)?._T) {
            const errorMsg = `Invalid telemetry event format. Events should have '_T' property`;
            console.error(errorMsg, 'First event:', events[0]);
            throw new Error(errorMsg);
          }

          this.setCache(cacheKey, events);
          observer.next(events);
          observer.complete();
        })
        .catch((error) => {
          console.error("Error fetching telemetry:", error);
          // Provide more specific error message based on the type of error
          let errorMessage = `Failed to fetch telemetry: ${error.message}`;

          if (error.message?.includes('404') || error.message?.includes('Not Found')) {
            errorMessage = 'Telemetry data not found. The match may be too old or the telemetry URL may be invalid.';
          } else if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
            errorMessage = 'PUBG API authentication failed. Please check your API key.';
          } else if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
            errorMessage = 'Access to telemetry data forbidden. Your API key may not have the required permissions.';
          }

          observer.error(new Error(errorMessage));
        });
    });
  }

  getPlayerMatches(playerId: string): Observable<MatchResponse[]> {
    const cacheKey = this.getCacheKey(`player-matches-${playerId}`);
    const cached = this.getFromCache<MatchResponse[]>(cacheKey);
    if (cached) {
      return of(cached);
    }

    return new Observable((observer) => {
      // First get the player by ID to access their match relationships
      this.pubgClient.players
        .getPlayerById(playerId)
        .then((playerResponse) => {
          const player = playerResponse.data[0] || playerResponse.data;

          // Extract match IDs from player relationships
          const matchIds = player.relationships?.matches?.data?.map((match: { id: string }) => match.id) || [];

          if (matchIds.length === 0) {
            this.setCache(cacheKey, []);
            observer.next([]);
            observer.complete();
            return;
          }

          // Fetch all matches in parallel (limit to recent 10 for performance)
          const recentMatchIds = matchIds.slice(0, 10);
          const matchPromises = recentMatchIds.map((matchId: string) =>
            this.pubgClient.matches
              .getMatch(matchId)
              .then((matchResponse) => matchResponse) // Return full response, not just data
              .catch((error) => {
                console.warn(`Failed to fetch match ${matchId}:`, error);
                return null; // Return null for failed matches
              }),
          );

          Promise.all(matchPromises)
            .then((matches: (MatchResponse | null)[]) => {
              const validMatches = matches.filter((match: MatchResponse | null) => match !== null) as MatchResponse[];
              this.setCache(cacheKey, validMatches);
              observer.next(validMatches);
              observer.complete();
            })
            .catch((error) => {
              console.error("Error fetching matches:", error);
              observer.error(new Error(`Failed to fetch matches: ${error.message}`));
            });
        })
        .catch((error) => {
          console.error("Error fetching player matches:", error);
          observer.error(new Error(`Failed to fetch player matches: ${error.message}`));
        });
    });
  }

  getPlayerSeasonStats(playerId: string, seasonId: string): Observable<unknown> {
    const cacheKey = this.getCacheKey(`player-season-stats-${playerId}-${seasonId}`);
    const cached = this.getFromCache<unknown>(cacheKey);
    if (cached) {
      return of(cached);
    }

    return new Observable((observer) => {
      this.pubgClient.players
        .getPlayerSeasonStats({ playerId, seasonId })
        .then((stats) => {
          this.setCache(cacheKey, stats);
          observer.next(stats);
          observer.complete();
        })
        .catch((error) => {
          console.error("Error fetching player season stats:", error);
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
      keys: Array.from(this.cache.keys()),
    };
  }
}
