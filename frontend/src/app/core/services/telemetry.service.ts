import { Injectable } from "@angular/core";
import { type Observable, of, throwError } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";
import {
  Shard as ApiShard,
  type LogPlayerKill,
  type LogPlayerPosition,
  type Match,
  type TelemetryEvent,
  type Location as TelemetryLocation,
} from "../models";
import type {
  AnalysisInsights,
  MatchAnalysis,
  MatchSummary,
  PlayerAnalysis,
  PlayerInsights,
  PlayerMatchStats,
} from "../models/analysis.models";
import { PubgApiService } from "./pubg-api.service";

interface WeaponStats {
  kills: number;
  damage: number;
  hits: number;
  headshots: number;
  accuracy: number;
}

interface PlayerTimelineEvent {
  time: number;
  event: string;
  position?: TelemetryLocation;
  details?: {
    killer: string;
    victim: string;
    weapon: string;
    distance: number;
  };
}

interface KeyMoment {
  timestamp: number;
  type: "kill" | "death" | "revive" | "escape" | "zone_close";
  description: string;
  impact: number;
  players: string[];
}

@Injectable({
  providedIn: "root",
})
export class TelemetryService {
  constructor(private pubgApiService: PubgApiService) {}

  analyzeMatch(matchId: string, playerNames: string[]): Observable<MatchAnalysis> {
    return this.pubgApiService.getMatch(matchId).pipe(
      switchMap((match) => {
        const telemetryUrl = this.extractTelemetryUrl(match);
        return this.pubgApiService
          .getTelemetry(telemetryUrl)
          .pipe(
            map((telemetry) => this.processTelemetry(telemetry, playerNames, match)),
            catchError((error) => {
              console.error("Error processing telemetry:", error);
              return throwError(() => new Error(`Failed to analyze match: ${error.message}`));
            }),
          );
      }),
      catchError((error) => {
        console.error("Error fetching match:", error);
        return throwError(() => new Error(`Failed to fetch match '${matchId}': ${error.message}`));
      }),
    );
  }

  private processTelemetry(telemetry: TelemetryEvent[], playerNames: string[], match: Match): MatchAnalysis {
    const playerAnalyses = this.analyzePlayers(telemetry, playerNames);
    const matchSummary = this.createMatchSummary(match, telemetry);
    const insights = this.generateInsights(playerAnalyses, telemetry);

    return {
      matchId: match.id,
      analysisDate: new Date().toISOString(),
      players: playerAnalyses,
      matchSummary,
      insights,
    };
  }

  private analyzePlayers(telemetry: TelemetryEvent[], playerNames: string[]): PlayerAnalysis[] {
    return playerNames.map((playerName) => {
      const playerEvents = telemetry.filter((event) => this.isPlayerEvent(event, playerName));

      const stats = this.calculatePlayerStats(playerEvents, playerName);
      const insights = this.generatePlayerInsights(stats, playerEvents);
      const timeline = this.createPlayerTimeline(playerEvents, playerName);

      return {
        name: playerName,
        id: this.getPlayerId(playerEvents, playerName),
        stats,
        insights,
        timeline,
      };
    });
  }

  private isPlayerEvent(event: TelemetryEvent, playerName: string): boolean {
    if (event._T === "LogPlayerKill") {
      const killEvent = event as LogPlayerKill;
      return killEvent.killer.name === playerName || killEvent.victim.name === playerName;
    }
    if (event._T === "LogPlayerPosition") {
      const positionEvent = event as LogPlayerPosition;
      return positionEvent.character.name === playerName;
    }
    return false;
  }

  private calculatePlayerStats(events: TelemetryEvent[], playerName: string): PlayerMatchStats {
    const kills = events.filter(
      (e) => e._T === "LogPlayerKill" && (e as LogPlayerKill).killer.name === playerName,
    ).length;

    const deaths = events.filter(
      (e) => e._T === "LogPlayerKill" && (e as LogPlayerKill).victim.name === playerName,
    ).length;

    const killEvents = events.filter(
      (e) => e._T === "LogPlayerKill" && (e as LogPlayerKill).killer.name === playerName,
    ) as LogPlayerKill[];

    const totalDamage = killEvents.reduce(
      (sum, event) => sum + (this.extractDamageFromKillEvent(event) || 0),
      0,
    );
    const totalDistance = this.calculateTotalDistance(events, playerName);

    return {
      kills,
      deaths,
      assists: 0, // Need to implement assist tracking
      damageDealt: totalDamage,
      damageTaken: 0, // Need to implement damage taken tracking
      survivalTime: this.calculateSurvivalTime(events, playerName),
      placement: this.getPlacement(events, playerName),
      weapons: this.analyzeWeaponUsage(killEvents),
      movement: {
        totalDistance,
        vehicleDistance: 0, // Need to implement vehicle tracking
        swimDistance: 0, // Need to implement swim tracking
        footDistance: totalDistance,
        avgSpeed: totalDistance / (this.calculateSurvivalTime(events, playerName) / 60),
        timeInVehicle: 0,
        timeInBlueZone: 0,
      },
      healing: {
        healthUsed: 0,
        boostUsed: 0,
        healingItems: {},
      },
      combat: {
        shotsFired: 0,
        shotsHit: 0,
        headshotPercentage: killEvents.filter((e) => e.damageCauserName.includes("Headshot")).length / kills || 0,
        longestKill: Math.max(...killEvents.map((e) => e.distance), 0),
        avgKillDistance: killEvents.reduce((sum, e) => sum + e.distance, 0) / kills || 0,
        damagePerKill: totalDamage / kills || 0,
      },
    };
  }

  private calculateTotalDistance(events: TelemetryEvent[], playerName: string): number {
    const positionEvents = events.filter(
      (e) => e._T === "LogPlayerPosition" && (e as LogPlayerPosition).character.name === playerName,
    ) as LogPlayerPosition[];

    let totalDistance = 0;
    for (let i = 1; i < positionEvents.length; i++) {
      const prev = positionEvents[i - 1].character.location;
      const curr = positionEvents[i].character.location;
      totalDistance += this.calculateDistance(prev, curr);
    }

    return totalDistance;
  }

  private calculateDistance(pos1: TelemetryLocation, pos2: TelemetryLocation): number {
    return Math.sqrt((pos2.x - pos1.x) ** 2 + (pos2.y - pos1.y) ** 2 + (pos2.z - pos1.z) ** 2);
  }

  private calculateSurvivalTime(events: TelemetryEvent[], playerName: string): number {
    const playerEvents = events.filter((e) => this.isPlayerEvent(e, playerName));
    if (playerEvents.length === 0) return 0;

    const firstEvent = playerEvents[0];
    const lastEvent = playerEvents[playerEvents.length - 1];

    const firstTime = firstEvent._D ? new Date(firstEvent._D).getTime() : Number.NaN;
    const lastTime = lastEvent._D ? new Date(lastEvent._D).getTime() : Number.NaN;
    if (Number.isNaN(firstTime) || Number.isNaN(lastTime)) {
      return 0;
    }
    return (lastTime - firstTime) / 1000;
  }

  private getPlacement(events: TelemetryEvent[], playerName: string): number {
    const deathEvent = events.find((e) => e._T === "LogPlayerKill" && (e as LogPlayerKill).victim.name === playerName);

    if (deathEvent && deathEvent._T === "LogPlayerKill") {
      const killEvent = deathEvent as LogPlayerKill;
      return this.extractRankFromKillEvent(killEvent) || 1;
    }

    return 1; // Survived to the end
  }

  private analyzeWeaponUsage(killEvents: LogPlayerKill[]): Record<string, WeaponStats> {
    const weaponStats: Record<string, WeaponStats> = {};

    killEvents.forEach((event) => {
      const weapon = event.damageCauserName;
      if (!weaponStats[weapon]) {
        weaponStats[weapon] = {
          kills: 0,
          damage: 0,
          hits: 0,
          headshots: 0,
          accuracy: 0,
        };
      }
      weaponStats[weapon].kills++;
      weaponStats[weapon].damage += this.extractDamageFromKillEvent(event) || 0;
    });

    return weaponStats;
  }

  private generatePlayerInsights(stats: PlayerMatchStats, events: TelemetryEvent[]): PlayerInsights {
    const kdRatio = stats.deaths === 0 ? stats.kills : stats.kills / stats.deaths;

    let performanceRating = 3; // Average
    if (kdRatio > 3) performanceRating = 5;
    else if (kdRatio > 2) performanceRating = 4;
    else if (kdRatio > 1) performanceRating = 3;
    else if (kdRatio > 0.5) performanceRating = 2;
    else performanceRating = 1;

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    if (stats.kills > 5) strengths.push("High kill count");
    if (stats.damageDealt > 1000) strengths.push("High damage output");
    if (stats.combat.headshotPercentage > 0.3) strengths.push("Good accuracy");

    if (stats.deaths > stats.kills) weaknesses.push("More deaths than kills");
    if (stats.movement.avgSpeed < 100) weaknesses.push("Low mobility");
    if (stats.combat.avgKillDistance < 50) weaknesses.push("Prefers close combat");

    if (kdRatio < 1) recommendations.push("Focus on survival and positioning");
    if (stats.combat.headshotPercentage < 0.2) recommendations.push("Improve aim and accuracy");
    if (stats.movement.totalDistance < 5000) recommendations.push("Increase map awareness and rotation");

    return {
      strengths,
      weaknesses,
      recommendations,
      performanceRating,
      improvementAreas: recommendations,
    };
  }

  private createPlayerTimeline(events: TelemetryEvent[], playerName: string): PlayerTimelineEvent[] {
    return events.map((event) => ({
      time: event._D ? new Date(event._D).getTime() : Date.now(),
      event: event._T,
      position: event._T === "LogPlayerPosition" ? (event as LogPlayerPosition).character.location : undefined,
      details:
        event._T === "LogPlayerKill"
          ? {
              killer: (event as LogPlayerKill).killer.name,
              victim: (event as LogPlayerKill).victim.name,
              weapon: (event as LogPlayerKill).damageCauserName,
              distance: (event as LogPlayerKill).distance,
            }
          : undefined,
    }));
  }

  private createMatchSummary(match: Match, telemetry: TelemetryEvent[]): MatchSummary {
    const duration = match.attributes.duration;
    const matchStartEvent = telemetry.find((e) => e._T === "LogMatchStart");
    const totalPlayers = this.extractTotalPlayersFromMatchStart(matchStartEvent) || 100;
    return {
      totalPlayers,
      matchDuration: duration,
      map: match.attributes.mapName,
      gameMode: match.attributes.gameMode,
      timeline: [], // TODO: Implement match timeline
    };
  }

  private generateInsights(playerAnalyses: PlayerAnalysis[], telemetry: TelemetryEvent[]): AnalysisInsights {
    const avgRating = playerAnalyses.reduce((sum, p) => sum + p.insights.performanceRating, 0) / playerAnalyses.length;

    return {
      overallMatchQuality: avgRating,
      keyMoments: this.extractKeyMoments(telemetry),
      teamPerformance: {
        coordination: avgRating * 0.8,
        communication: avgRating * 0.7,
        strategy: avgRating * 0.9,
        overallRating: avgRating,
      },
      strategicInsights: this.generateStrategicInsights(playerAnalyses),
    };
  }

  private extractKeyMoments(telemetry: TelemetryEvent[]): KeyMoment[] {
    return telemetry
      .filter((e) => e._T === "LogPlayerKill")
      .slice(0, 10)
      .map((event) => {
        const killEvent = event as LogPlayerKill;
        return {
          timestamp: event._D ? new Date(event._D).getTime() : Date.now(),
          type: "kill",
          description: `${killEvent.killer.name} eliminated ${killEvent.victim.name}`,
          impact: 5,
          players: [killEvent.killer.name, killEvent.victim.name],
        };
      });
  }

  private generateStrategicInsights(playerAnalyses: PlayerAnalysis[]): string[] {
    const insights: string[] = [];

    const avgSurvivalTime = playerAnalyses.reduce((sum, p) => sum + p.stats.survivalTime, 0) / playerAnalyses.length;
    if (avgSurvivalTime < 600) {
      insights.push("Team eliminated early - focus on better landing strategy");
    }

    const totalKills = playerAnalyses.reduce((sum, p) => sum + p.stats.kills, 0);
    if (totalKills < playerAnalyses.length * 2) {
      insights.push("Low kill count - improve engagement and positioning");
    }

    return insights;
  }

  private getPlayerId(events: TelemetryEvent[], playerName: string): string {
    const playerEvent = events.find((e) => this.isPlayerEvent(e, playerName));
    if (playerEvent && playerEvent._T === "LogPlayerKill") {
      const killEvent = playerEvent as LogPlayerKill;
      return killEvent.killer.name === playerName ? killEvent.killer.accountId : killEvent.victim.accountId;
    }
    return playerName;
  }

  private extractTelemetryUrl(match: Match): string {
    // Handle type-safe extraction of telemetry URL
    const matchData = match as unknown as {
      relationships?: {
        assets?: {
          data?: Array<{
            attributes?: {
              URL?: string;
            };
          }>;
        };
      };
    };
    return matchData.relationships?.assets?.data?.[0]?.attributes?.URL || "";
  }

  private extractDamageFromKillEvent(event: LogPlayerKill): number {
    // Handle type-safe extraction of damage from kill event
    const eventData = event as unknown as {
      victimGameResult?: {
        stats?: {
          damageDealt?: number;
        };
      };
    };
    return eventData.victimGameResult?.stats?.damageDealt || 0;
  }

  private extractRankFromKillEvent(killEvent: LogPlayerKill): number {
    // Handle type-safe extraction of rank from kill event
    const eventData = killEvent as unknown as {
      victimGameResult?: {
        stats?: {
          rank?: number;
        };
      };
    };
    return eventData.victimGameResult?.stats?.rank || 1;
  }

  private extractTotalPlayersFromMatchStart(matchStartEvent: TelemetryEvent | undefined): number {
    if (!matchStartEvent) return 100;
    // Handle type-safe extraction of total players from match start event
    const eventData = matchStartEvent as unknown as {
      characters?: unknown[];
    };
    return eventData.characters?.length || 100;
  }
}
