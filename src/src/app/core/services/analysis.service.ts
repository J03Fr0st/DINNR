import { Injectable } from '@angular/core';
import { Observable, of, throwError, forkJoin } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { PubgApiService } from './pubg-api.service';
import { TelemetryService } from './telemetry.service';
import { MatchAnalysis, PlayerAnalysis, PlayerMatchStats, PlayerInsights } from '../models/analysis.models';
import { MatchAnalysisForm, PlayerSearchForm } from '../models/ui.models';
import { Shard, Player, Match } from '../models';

export interface PlayerStats {
  playerName: string;
  playerId: string;
  overallStats: {
    matchesPlayed: number;
    wins: number;
    kills: number;
    deaths: number;
    kdRatio: number;
    winRate: number;
    avgDamage: number;
    avgSurvivalTime: number;
  };
  recentMatches: MatchHistory[];
}

export interface MatchHistory {
  matchId: string;
  date: string;
  placement: number;
  kills: number;
  damage: number;
  survivalTime: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalysisService {
  constructor(
    private pubgApiService: PubgApiService,
    private telemetryService: TelemetryService
  ) {}

  analyzeMatch(matchId: string, playerNames: string[], shard: Shard = Shard.PC_NA): Observable<MatchAnalysis> {
    if (!this.validateMatchId(matchId)) {
      return throwError(() => new Error('Invalid match ID format'));
    }

    if (!playerNames || playerNames.length === 0) {
      return throwError(() => new Error('At least one player name is required'));
    }

    return this.telemetryService.analyzeMatch(matchId, playerNames, shard);
  }

  getPlayerStats(playerName: string, shard: Shard = Shard.PC_NA): Observable<PlayerStats> {
    if (!playerName || playerName.trim().length === 0) {
      return throwError(() => new Error('Player name is required'));
    }

    return this.pubgApiService.getPlayerByName(playerName, shard).pipe(
      switchMap(player => {
        return this.pubgApiService.getPlayerMatches(player.id, shard).pipe(
          map(matches => this.calculatePlayerStats(player, matches)),
          catchError(error => {
            console.error('Error calculating player stats:', error);
            return throwError(() => new Error(`Failed to calculate stats for ${playerName}: ${error.message}`));
          })
        );
      }),
      catchError(error => {
        console.error('Error fetching player:', error);
        return throwError(() => new Error(`Failed to fetch player ${playerName}: ${error.message}`));
      })
    );
  }

  getPlayerHistory(playerName: string, shard: Shard = Shard.PC_NA): Observable<MatchHistory[]> {
    return this.getPlayerStats(playerName, shard).pipe(
      map(stats => stats.recentMatches)
    );
  }

  comparePlayers(playerNames: string[], shard: Shard = Shard.PC_NA): Observable<PlayerStats[]> {
    if (!playerNames || playerNames.length < 2) {
      return throwError(() => new Error('At least two players are required for comparison'));
    }

    const playerStats$ = playerNames.map(name => this.getPlayerStats(name, shard));
    
    return forkJoin(playerStats$).pipe(
      catchError(error => {
        console.error('Error comparing players:', error);
        return throwError(() => new Error(`Failed to compare players: ${error.message}`));
      })
    );
  }

  submitMatchAnalysis(form: MatchAnalysisForm): Observable<MatchAnalysis> {
    return this.analyzeMatch(form.matchId, form.playerNames, form.shard);
  }

  searchPlayer(form: PlayerSearchForm): Observable<PlayerStats> {
    return this.getPlayerStats(form.playerName, form.shard);
  }

  private calculatePlayerStats(player: Player, matches: Match[]): PlayerStats {
    const recentMatches = matches.slice(0, 10).map(match => ({
      matchId: match.id,
      date: match.attributes.createdAt,
      placement: this.getPlacementFromMatch(match, player.id),
      kills: this.getKillsFromMatch(match, player.id),
      damage: this.getDamageFromMatch(match, player.id),
      survivalTime: this.getSurvivalTimeFromMatch(match, player.id)
    }));

    const totalMatches = matches.length;
    const totalWins = recentMatches.filter(m => m.placement === 1).length;
    const totalKills = recentMatches.reduce((sum, m) => sum + m.kills, 0);
    const totalDamage = recentMatches.reduce((sum, m) => sum + m.damage, 0);
    const totalSurvivalTime = recentMatches.reduce((sum, m) => sum + m.survivalTime, 0);
    const totalDeaths = recentMatches.filter(m => m.placement > 1).length;

    return {
      playerName: player.attributes.name,
      playerId: player.id,
      overallStats: {
        matchesPlayed: totalMatches,
        wins: totalWins,
        kills: totalKills,
        deaths: totalDeaths,
        kdRatio: totalDeaths === 0 ? totalKills : totalKills / totalDeaths,
        winRate: totalMatches === 0 ? 0 : (totalWins / totalMatches) * 100,
        avgDamage: totalMatches === 0 ? 0 : totalDamage / totalMatches,
        avgSurvivalTime: totalMatches === 0 ? 0 : totalSurvivalTime / totalMatches
      },
      recentMatches
    };
  }

  private getPlacementFromMatch(match: Match, playerId: string): number {
    const participant = match.relationships.participants.data.find((p: any) => {
      return match.included?.find((inc: any) => 
        inc.type === 'participant' && inc.id === p.id && inc.attributes.playerId === playerId
      );
    });

    if (participant) {
      const participantData = match.included?.find((inc: any) => inc.id === participant.id);
      return participantData?.attributes?.winPlace || 0;
    }

    return 0;
  }

  private getKillsFromMatch(match: Match, playerId: string): number {
    const participant = match.relationships.participants.data.find((p: any) => {
      return match.included?.find((inc: any) => 
        inc.type === 'participant' && inc.id === p.id && inc.attributes.playerId === playerId
      );
    });

    if (participant) {
      const participantData = match.included?.find((inc: any) => inc.id === participant.id);
      return participantData?.attributes?.kills || 0;
    }

    return 0;
  }

  private getDamageFromMatch(match: Match, playerId: string): number {
    const participant = match.relationships.participants.data.find((p: any) => {
      return match.included?.find((inc: any) => 
        inc.type === 'participant' && inc.id === p.id && inc.attributes.playerId === playerId
      );
    });

    if (participant) {
      const participantData = match.included?.find((inc: any) => inc.id === participant.id);
      return participantData?.attributes?.damageDealt || 0;
    }

    return 0;
  }

  private getSurvivalTimeFromMatch(match: Match, playerId: string): number {
    const participant = match.relationships.participants.data.find((p: any) => {
      return match.included?.find((inc: any) => 
        inc.type === 'participant' && inc.id === p.id && inc.attributes.playerId === playerId
      );
    });

    if (participant) {
      const participantData = match.included?.find((inc: any) => inc.id === participant.id);
      return participantData?.attributes?.timeSurvived || 0;
    }

    return 0;
  }

  private validateMatchId(matchId: string): boolean {
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return guidRegex.test(matchId);
  }

  exportMatchAnalysis(analysis: MatchAnalysis): string {
    return JSON.stringify(analysis, null, 2);
  }

  exportPlayerStats(stats: PlayerStats): string {
    return JSON.stringify(stats, null, 2);
  }

  clearCache(): void {
    this.pubgApiService.clearCache();
  }

  getCacheStats(): any {
    return this.pubgApiService.getCacheStats();
  }
}