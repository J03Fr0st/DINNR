import { Injectable } from "@angular/core";
import { Observable, of, throwError, forkJoin } from "rxjs";
import { map, catchError, switchMap } from "rxjs/operators";
import { PubgApiService } from "./pubg-api.service";
import { TelemetryService } from "./telemetry.service";
import { MatchAnalysis, PlayerAnalysis, PlayerMatchStats, PlayerInsights } from "../models/analysis.models";
import { MatchAnalysisForm, PlayerSearchForm, Shard as UiShard } from "../models/ui.models";
import { Shard as ApiShard, Player, Match } from "../models";

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
  recentMatches: {
    matchId: string;
    mapName: string;
    gameMode: string;
    kills: number;
    placement: number;
    damageDealt: number;
    survivalTime: number;
    date: string;
  }[];
}

export interface MatchHistory {
  matchId: string;
  playerName: string;
  mapName: string;
  gameMode: string;
  kills: number;
  placement: number;
  damageDealt: number;
  survivalTime: number;
  date: string;
}

@Injectable({
  providedIn: "root",
})
export class AnalysisService {
  constructor(
    private pubgApiService: PubgApiService,
    private telemetryService: TelemetryService,
  ) {}

  analyzeMatch(matchId: string, playerNames: string[]): Observable<MatchAnalysis> {
    if (!this.validateMatchId(matchId)) {
      return throwError(() => new Error("Invalid match ID format"));
    }

    if (!playerNames || playerNames.length === 0) {
      return throwError(() => new Error("At least one player name is required"));
    }

    return this.telemetryService.analyzeMatch(matchId, playerNames);
  }

  getPlayerStats(playerName: string): Observable<PlayerStats> {
    if (!playerName || playerName.trim().length === 0) {
      return throwError(() => new Error("Player name is required"));
    }

    return this.pubgApiService
      .getPlayerByName(playerName)
      .pipe(
        switchMap((player) =>
          this.pubgApiService
            .getPlayerMatches(player.id)
            .pipe(map((matches) => this.calculatePlayerStats(player, matches))),
        ),
      );
  }

  getPlayerHistory(playerName: string, shard: ApiShard = "pc-na" as ApiShard): Observable<MatchHistory[]> {
    return this.getPlayerStats(playerName).pipe(
      map((stats) =>
        stats.recentMatches.map((match) => ({
          ...match,
          playerName: stats.playerName,
        })),
      ),
    );
  }

  comparePlayers(playerNames: string[]): Observable<PlayerStats[]> {
    if (!playerNames || playerNames.length < 2) {
      return throwError(() => new Error("At least two players are required for comparison"));
    }

    const playerObservables = playerNames.map((name) => this.getPlayerStats(name));
    return forkJoin(playerObservables);
  }

  submitMatchAnalysis(form: MatchAnalysisForm): Observable<MatchAnalysis> {
    return this.analyzeMatch(form.matchId, form.playerNames);
  }

  searchPlayer(form: PlayerSearchForm): Observable<PlayerStats> {
    return this.getPlayerStats(form.playerName);
  }

  private calculatePlayerStats(player: Player, matches: Match[]): PlayerStats {
    const recentMatches = matches.slice(0, 10).map((match) => ({
      matchId: match.id,
      mapName: match.attributes.mapName,
      gameMode: match.attributes.gameMode,
      kills: this.getKillsFromMatch(match, player.id),
      placement: this.getPlacementFromMatch(match, player.id),
      damageDealt: this.getDamageFromMatch(match, player.id),
      survivalTime: this.getSurvivalTimeFromMatch(match, player.id),
      date: match.attributes.createdAt,
    }));

    const totalMatches = matches.length;
    const totalKills = recentMatches.reduce((sum, match) => sum + match.kills, 0);
    const totalDeaths = recentMatches.reduce((sum, match) => sum + (match.placement === 1 ? 0 : 1), 0);
    const totalWins = recentMatches.filter((match) => match.placement === 1).length;
    const totalDamage = recentMatches.reduce((sum, match) => sum + match.damageDealt, 0);
    const totalSurvivalTime = recentMatches.reduce((sum, match) => sum + match.survivalTime, 0);

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
        avgSurvivalTime: totalMatches === 0 ? 0 : totalSurvivalTime / totalMatches,
      },
      recentMatches,
    };
  }

  private getPlacementFromMatch(match: Match, playerId: string): number {
    // Since we're using HTTP API directly, we'll need to parse the match data differently
    // For now, return a default value until we have the correct Match structure
    return 0;
  }

  private getKillsFromMatch(match: Match, playerId: string): number {
    // Since we're using HTTP API directly, we'll need to parse the match data differently
    // For now, return a default value until we have the correct Match structure
    return 0;
  }

  private getDamageFromMatch(match: Match, playerId: string): number {
    // Since we're using HTTP API directly, we'll need to parse the match data differently
    // For now, return a default value until we have the correct Match structure
    return 0;
  }

  private getSurvivalTimeFromMatch(match: Match, playerId: string): number {
    // Since we're using HTTP API directly, we'll need to parse the match data differently
    // For now, return a default value until we have the correct Match structure
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
