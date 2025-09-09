import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { PubgApiService } from './pubg-api.service';
import { 
  TelemetryEvent, 
  LogPlayerPosition, 
  LogPlayerKill, 
  isPlayerKillEvent, 
  isPlayerPositionEvent,
  Vector3 
} from '../models';
import { MatchAnalysis, PlayerAnalysis, PlayerMatchStats, PlayerInsights, MatchSummary, AnalysisInsights } from '../models/analysis.models';
import { Shard } from '../models/ui.models';

@Injectable({
  providedIn: 'root'
})
export class TelemetryService {
  constructor(private pubgApiService: PubgApiService) {}

  analyzeMatch(matchId: string, playerNames: string[], shard: Shard = Shard.PC_NA): Observable<MatchAnalysis> {
    return this.pubgApiService.getMatch(matchId, shard).pipe(
      switchMap(match => {
        return this.pubgApiService.getTelemetry(match.relationships.assets.data[0].attributes.URL).pipe(
          map(telemetry => this.processTelemetry(telemetry, playerNames, match)),
          catchError(error => {
            console.error('Error processing telemetry:', error);
            return throwError(() => new Error(`Failed to analyze match: ${error.message}`));
          })
        );
      }),
      catchError(error => {
        console.error('Error fetching match:', error);
        return throwError(() => new Error(`Failed to fetch match '${matchId}': ${error.message}`));
      })
    );
  }

  private processTelemetry(
    telemetry: TelemetryEvent[], 
    playerNames: string[], 
    match: any
  ): MatchAnalysis {
    const playerAnalyses = this.analyzePlayers(telemetry, playerNames);
    const matchSummary = this.createMatchSummary(match, telemetry);
    const insights = this.generateInsights(playerAnalyses, telemetry);

    return {
      matchId: match.id,
      analysisDate: new Date().toISOString(),
      players: playerAnalyses,
      matchSummary,
      insights
    };
  }

  private analyzePlayers(telemetry: TelemetryEvent[], playerNames: string[]): PlayerAnalysis[] {
    return playerNames.map(playerName => {
      const playerEvents = telemetry.filter(event => 
        this.isPlayerEvent(event, playerName)
      );

      const stats = this.calculatePlayerStats(playerEvents, playerName);
      const insights = this.generatePlayerInsights(stats, playerEvents);
      const timeline = this.createPlayerTimeline(playerEvents, playerName);

      return {
        name: playerName,
        id: this.getPlayerId(playerEvents, playerName),
        stats,
        insights,
        timeline
      };
    });
  }

  private isPlayerEvent(event: TelemetryEvent, playerName: string): boolean {
    if (isPlayerKillEvent(event)) {
      return event.killer.name === playerName || event.victim.name === playerName;
    }
    if (isPlayerPositionEvent(event)) {
      return event.character.name === playerName;
    }
    return false;
  }

  private calculatePlayerStats(events: TelemetryEvent[], playerName: string): PlayerMatchStats {
    const kills = events.filter(e => 
      isPlayerKillEvent(e) && e.killer.name === playerName
    ).length;

    const deaths = events.filter(e => 
      isPlayerKillEvent(e) && e.victim.name === playerName
    ).length;

    const killEvents = events.filter(e => 
      isPlayerKillEvent(e) && e.killer.name === playerName
    ) as LogPlayerKill[];

    const totalDamage = killEvents.reduce((sum, event) => sum + (event.victimGameResult.stats?.damageDealt || 0), 0);
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
        timeInBlueZone: 0
      },
      healing: {
        healthUsed: 0,
        boostUsed: 0,
        healingItems: {}
      },
      combat: {
        shotsFired: 0,
        shotsHit: 0,
        headshotPercentage: killEvents.filter(e => e.damageCauserName.includes('Headshot')).length / kills || 0,
        longestKill: Math.max(...killEvents.map(e => e.distance), 0),
        avgKillDistance: killEvents.reduce((sum, e) => sum + e.distance, 0) / kills || 0,
        damagePerKill: totalDamage / kills || 0
      }
    };
  }

  private calculateTotalDistance(events: TelemetryEvent[], playerName: string): number {
    const positionEvents = events.filter(e => 
      isPlayerPositionEvent(e) && e.character.name === playerName
    ) as LogPlayerPosition[];

    let totalDistance = 0;
    for (let i = 1; i < positionEvents.length; i++) {
      const prev = positionEvents[i - 1].character.location;
      const curr = positionEvents[i].character.location;
      totalDistance += this.calculateDistance(prev, curr);
    }

    return totalDistance;
  }

  private calculateDistance(pos1: Vector3, pos2: Vector3): number {
    return Math.sqrt(
      Math.pow(pos2.x - pos1.x, 2) +
      Math.pow(pos2.y - pos1.y, 2) +
      Math.pow(pos2.z - pos1.z, 2)
    );
  }

  private calculateSurvivalTime(events: TelemetryEvent[], playerName: number): number {
    const playerEvents = events.filter(e => this.isPlayerEvent(e, playerName));
    if (playerEvents.length === 0) return 0;

    const firstEvent = playerEvents[0];
    const lastEvent = playerEvents[playerEvents.length - 1];
    
    return (new Date(lastEvent.timestamp).getTime() - new Date(firstEvent.timestamp).getTime()) / 1000;
  }

  private getPlacement(events: TelemetryEvent[], playerName: string): number {
    const deathEvent = events.find(e => 
      isPlayerKillEvent(e) && e.victim.name === playerName
    );
    
    if (deathEvent && isPlayerKillEvent(deathEvent)) {
      return deathEvent.victimGameResult.stats?.winPlace || 0;
    }
    
    return 1; // Survived to the end
  }

  private analyzeWeaponUsage(killEvents: LogPlayerKill[]): any {
    const weaponStats: any = {};
    
    killEvents.forEach(event => {
      const weapon = event.damageCauserName;
      if (!weaponStats[weapon]) {
        weaponStats[weapon] = {
          kills: 0,
          damage: 0,
          hits: 0,
          headshots: 0,
          accuracy: 0
        };
      }
      weaponStats[weapon].kills++;
      weaponStats[weapon].damage += event.victimGameResult.stats?.damageDealt || 0;
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

    if (stats.kills > 5) strengths.push('High kill count');
    if (stats.damageDealt > 1000) strengths.push('High damage output');
    if (stats.combat.headshotPercentage > 0.3) strengths.push('Good accuracy');
    
    if (stats.deaths > stats.kills) weaknesses.push('More deaths than kills');
    if (stats.movement.avgSpeed < 100) weaknesses.push('Low mobility');
    if (stats.combat.avgKillDistance < 50) weaknesses.push('Prefers close combat');
    
    if (kdRatio < 1) recommendations.push('Focus on survival and positioning');
    if (stats.combat.headshotPercentage < 0.2) recommendations.push('Improve aim and accuracy');
    if (stats.movement.totalDistance < 5000) recommendations.push('Increase map awareness and rotation');

    return {
      strengths,
      weaknesses,
      recommendations,
      performanceRating,
      improvementAreas: recommendations
    };
  }

  private createPlayerTimeline(events: TelemetryEvent[], playerName: string): any[] {
    return events.map(event => ({
      time: new Date(event.timestamp).getTime(),
      event: event.type,
      position: isPlayerPositionEvent(event) ? event.character.location : undefined,
      details: isPlayerKillEvent(event) ? {
        killer: event.killer.name,
        victim: event.victim.name,
        weapon: event.damageCauserName,
        distance: event.distance
      } : undefined
    }));
  }

  private createMatchSummary(match: any, telemetry: TelemetryEvent[]): MatchSummary {
    const duration = match.attributes.duration;
    const totalPlayers = telemetry.filter(e => e.type === 'LogMatchStart')[0]?.characters?.length || 100;
    
    return {
      totalPlayers,
      matchDuration: duration,
      map: match.attributes.mapName,
      gameMode: match.attributes.gameMode,
      timeline: [] // TODO: Implement match timeline
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
        overallRating: avgRating
      },
      strategicInsights: this.generateStrategicInsights(playerAnalyses)
    };
  }

  private extractKeyMoments(telemetry: TelemetryEvent[]): any[] {
    return telemetry
      .filter(e => isPlayerKillEvent(e))
      .slice(0, 10)
      .map(event => ({
        timestamp: new Date(event.timestamp).getTime(),
        type: 'kill',
        description: `${event.killer.name} eliminated ${event.victim.name}`,
        impact: 5,
        players: [event.killer.name, event.victim.name]
      }));
  }

  private generateStrategicInsights(playerAnalyses: PlayerAnalysis[]): string[] {
    const insights: string[] = [];
    
    const avgSurvivalTime = playerAnalyses.reduce((sum, p) => sum + p.stats.survivalTime, 0) / playerAnalyses.length;
    if (avgSurvivalTime < 600) {
      insights.push('Team eliminated early - focus on better landing strategy');
    }
    
    const totalKills = playerAnalyses.reduce((sum, p) => sum + p.stats.kills, 0);
    if (totalKills < playerAnalyses.length * 2) {
      insights.push('Low kill count - improve engagement and positioning');
    }
    
    return insights;
  }

  private getPlayerId(events: TelemetryEvent[], playerName: string): string {
    const playerEvent = events.find(e => this.isPlayerEvent(e, playerName));
    if (isPlayerKillEvent(playerEvent)) {
      return playerEvent.killer.name === playerName ? 
        playerEvent.killer.name : playerEvent.victim.name;
    }
    return playerName;
  }
}