import { Injectable } from "@angular/core";
import { type Observable, forkJoin, of, throwError } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";
import type { Shard as ApiShard, Match, MatchResponse, ParticipantAttributes, Player } from "../models";
import { type MatchAnalysis, PlayerAnalysis, PlayerInsights, PlayerMatchStats } from "../models/analysis.models";
import { type MatchAnalysisForm, type PlayerSearchForm, Shard as UiShard } from "../models/ui.models";
import { PubgApiService } from "./pubg-api.service";
import { TelemetryService } from "./telemetry.service";

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

  private calculatePlayerStats(player: Player, matches: MatchResponse[]): PlayerStats {
    const recentMatches = matches.slice(0, 10).map((matchResponse) => ({
      matchId: matchResponse.data.id,
      mapName: matchResponse.data.attributes.mapName,
      gameMode: matchResponse.data.attributes.gameMode,
      kills: this.getKillsFromMatchResponse(matchResponse, player.id),
      placement: this.getPlacementFromMatchResponse(matchResponse, player.id),
      damageDealt: this.getDamageFromMatchResponse(matchResponse, player.id),
      survivalTime: this.getSurvivalTimeFromMatchResponse(matchResponse, player.id),
      date: matchResponse.data.attributes.createdAt,
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

  private getPlacementFromMatchResponse(matchResponse: MatchResponse, playerId: string): number {
    const participantData = matchResponse.included?.find(
      (inc) => inc.type === "participant" && (inc.attributes as ParticipantAttributes)?.stats?.playerId === playerId,
    );
    if (participantData?.attributes && "stats" in participantData.attributes) {
      return (participantData.attributes as ParticipantAttributes).stats.winPlace || 0;
    }
    return 0;
  }

  private getKillsFromMatchResponse(matchResponse: MatchResponse, playerId: string): number {
    const participantData = matchResponse.included?.find(
      (inc) => inc.type === "participant" && (inc.attributes as ParticipantAttributes)?.stats?.playerId === playerId,
    );
    if (participantData?.attributes && "stats" in participantData.attributes) {
      return (participantData.attributes as ParticipantAttributes).stats.kills || 0;
    }
    return 0;
  }

  private getDamageFromMatchResponse(matchResponse: MatchResponse, playerId: string): number {
    const participantData = matchResponse.included?.find(
      (inc) => inc.type === "participant" && (inc.attributes as ParticipantAttributes)?.stats?.playerId === playerId,
    );
    if (participantData?.attributes && "stats" in participantData.attributes) {
      return (participantData.attributes as ParticipantAttributes).stats.damageDealt || 0;
    }
    return 0;
  }

  private getSurvivalTimeFromMatchResponse(matchResponse: MatchResponse, playerId: string): number {
    const participantData = matchResponse.included?.find(
      (inc) => inc.type === "participant" && (inc.attributes as ParticipantAttributes)?.stats?.playerId === playerId,
    );
    if (participantData?.attributes && "stats" in participantData.attributes) {
      return (participantData.attributes as ParticipantAttributes).stats.timeSurvived || 0;
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

  getCacheStats(): { size: number; keys: string[] } {
    return this.pubgApiService.getCacheStats();
  }
}
