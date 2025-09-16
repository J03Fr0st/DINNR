import { Injectable } from "@angular/core";
import { type Observable, throwError } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";
import {
  type LogGameStatePeriodic,
  type LogHeal,
  type LogItemUse,
  type LogMatchEnd,
  type LogMatchStart,
  type LogPlayerKill,
  type LogPlayerKillV2,
  type LogPlayerPosition,
  type LogPlayerRevive,
  type LogPlayerTakeDamage,
  type LogSwimEnd,
  type LogSwimStart,
  type LogVehicleLeave,
  type LogVehicleRide,
  type LogWeaponFireCount,
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
  PlayerTimeline,
  WeaponStats,
} from "../models/analysis.models";
import { PubgApiService } from "./pubg-api.service";

interface WeaponAggregation {
  kills: number;
  damage: number;
  hits: number;
  headshots: number;
  shotsFired: number;
}

interface PlayerComputationResult {
  accountId: string | null;
  stats: PlayerMatchStats;
  timeline: PlayerTimeline[];
}

const HEAL_ITEM_DURATIONS: Record<string, number> = {
  Item_Heal_FirstAid_C: 6,
  Item_Heal_MedKit_C: 8,
  Item_Heal_Bandage_C: 4,
  Item_Boost_EnergyDrink_C: 4,
  Item_Boost_PainKiller_C: 6,
  Item_Boost_AdrenalineSyringe_C: 8,
};

@Injectable({
  providedIn: "root",
})
export class TelemetryService {
  constructor(private pubgApiService: PubgApiService) {}

  analyzeMatch(matchId: string, playerNames: string[]): Observable<MatchAnalysis> {
    return this.pubgApiService.getMatch(matchId).pipe(
      switchMap((match) =>
        this.pubgApiService.getTelemetry(this.extractTelemetryUrl(match)).pipe(
          map((telemetry) => this.processTelemetry(telemetry, playerNames, match)),
          catchError((error) => {
            console.error("Error processing telemetry:", error);
            return throwError(() => new Error(`Failed to analyze match: ${error.message}`));
          }),
        ),
      ),
      catchError((error) => {
        console.error("Error fetching match:", error);
        return throwError(() => new Error(`Failed to fetch match '${matchId}': ${error.message}`));
      }),
    );
  }

  private processTelemetry(telemetry: TelemetryEvent[], playerNames: string[], match: Match): MatchAnalysis {
    const matchStartEvent = telemetry.find((event) => event._T === "LogMatchStart") as LogMatchStart | undefined;
    const matchEndEvent = telemetry.find((event) => event._T === "LogMatchEnd") as LogMatchEnd | undefined;

    const matchStartTime = matchStartEvent ? this.toTimestamp(matchStartEvent._D) : null;
    const matchEndTime = matchEndEvent ? this.toTimestamp(matchEndEvent._D) : null;

    const playerAnalyses = this.analyzePlayers(telemetry, playerNames, matchStartTime, matchEndTime);
    const matchSummary = this.createMatchSummary(match, telemetry, matchStartEvent, matchStartTime, matchEndTime);
    const insights = this.generateInsights(playerAnalyses, telemetry, matchSummary);

    return {
      matchId: match.id,
      analysisDate: new Date().toISOString(),
      players: playerAnalyses,
      matchSummary,
      insights,
    };
  }

  private analyzePlayers(
    telemetry: TelemetryEvent[],
    playerNames: string[],
    matchStartTime: number | null,
    matchEndTime: number | null,
  ): PlayerAnalysis[] {
    return playerNames.map((playerName) => {
      const result = this.calculatePlayerDetails(telemetry, playerName, matchStartTime, matchEndTime);
      return {
        name: playerName,
        id: result.accountId ?? playerName,
        stats: result.stats,
        insights: this.generatePlayerInsights(result.stats),
        timeline: result.timeline,
      };
    });
  }

  private calculatePlayerDetails(
    telemetry: TelemetryEvent[],
    playerName: string,
    matchStartTime: number | null,
    matchEndTime: number | null,
  ): PlayerComputationResult {
    let kills = 0;
    let deaths = 0;
    let assists = 0;
    let damageDealt = 0;
    let damageTaken = 0;
    let shotsFired = 0;
    let shotsHit = 0;
    let headshotKills = 0;
    let totalKillDistance = 0;
    let longestKillDistance = 0;

    let survivalStart = matchStartTime;
    let deathTimestamp: number | null = null;
    let lastEventTimestamp: number | null = null;
    let placement = 0;

    let accountId: string | null = null;

    const weaponStats: Record<string, WeaponAggregation> = {};
    const healingItems: Record<string, { used: number; time: number }> = {};

    let healthUsed = 0;
    let boostUsed = 0;

    let totalDistance = 0;
    let vehicleDistance = 0;
    let swimDistance = 0;

    let vehicleTime = 0;
    let timeInBlueZone = 0;

    let lastPosition: TelemetryLocation | null = null;
    let lastPositionTimestamp: number | null = null;
    let lastBlueZoneEntry: number | null = null;
    let inBlueZone = false;

    const timeline: PlayerTimeline[] = [];

    const activeVehicleRides = new Map<string, number>();
    let activeSwimStart: number | null = null;

    for (const event of telemetry) {
      const timestamp = this.toTimestamp(event._D);
      if (timestamp !== null) {
        lastEventTimestamp = timestamp;
        if (survivalStart === null) {
          survivalStart = timestamp;
        }
      }

      switch (event._T) {
        case "LogPlayerPosition": {
          const positionEvent = event as LogPlayerPosition;
          if (positionEvent.character.name !== playerName) {
            break;
          }

          accountId = accountId ?? positionEvent.character.accountId ?? null;

          if (lastPosition && lastPositionTimestamp !== null && timestamp !== null) {
            totalDistance += this.calculateDistanceMeters(lastPosition, positionEvent.character.location);
          }

          if (timestamp !== null) {
            if (inBlueZone && lastBlueZoneEntry !== null) {
              timeInBlueZone += (timestamp - lastBlueZoneEntry) / 1000;
              lastBlueZoneEntry = timestamp;
            } else if (positionEvent.character.isInBlueZone) {
              lastBlueZoneEntry = timestamp;
            }
          }

          inBlueZone = positionEvent.character.isInBlueZone;
          if (!inBlueZone) {
            lastBlueZoneEntry = null;
          }

          lastPosition = positionEvent.character.location;
          lastPositionTimestamp = timestamp;
          break;
        }

        case "LogPlayerKill": {
          const killEvent = event as LogPlayerKill;

          if (killEvent.killer.name === playerName) {
            kills += 1;
            accountId = accountId ?? killEvent.killer.accountId ?? null;
            const distance = this.toMeters(killEvent.distance);
            totalKillDistance += distance;
            longestKillDistance = Math.max(longestKillDistance, distance);
            const isHeadshot = killEvent.damageReason === "HeadShot";
            if (isHeadshot) {
              headshotKills += 1;
            }
            this.incrementWeaponKills(weaponStats, killEvent.damageCauserName, isHeadshot);
            timeline.push({
              time: timestamp ?? Date.now(),
              event: "kill",
              position: killEvent.killer.location,
              details: {
                killer: killEvent.killer.name,
                victim: killEvent.victim.name,
                weapon: killEvent.damageCauserName,
                distance,
              },
            });
          }

          if (killEvent.victim.name === playerName) {
            deaths += 1;
            accountId = accountId ?? killEvent.victim.accountId ?? null;
            placement = this.extractRankFromKillEvent(killEvent) ?? placement;
            deathTimestamp = timestamp ?? deathTimestamp;
            timeline.push({
              time: timestamp ?? Date.now(),
              event: "death",
              position: killEvent.victim.location,
              details: {
                killer: killEvent.killer.name,
                victim: killEvent.victim.name,
                weapon: killEvent.damageCauserName,
                distance: this.toMeters(killEvent.distance),
              },
            });
          }

          if (killEvent.assistant && killEvent.assistant.name === playerName) {
            assists += 1;
          }

          break;
        }

        case "LogPlayerKillV2": {
          const killEvent = event as LogPlayerKillV2;

          if (killEvent.killer.name === playerName) {
            kills += 1;
            accountId = accountId ?? killEvent.killer.accountId ?? null;
            const distance = this.toMeters(killEvent.distance);
            totalKillDistance += distance;
            longestKillDistance = Math.max(longestKillDistance, distance);
            const isHeadshot = killEvent.damageReason === "HeadShot";
            if (isHeadshot) {
              headshotKills += 1;
            }
            this.incrementWeaponKills(weaponStats, killEvent.damageCauserName, isHeadshot);
            timeline.push({
              time: timestamp ?? Date.now(),
              event: "kill",
              position: killEvent.killer.location,
              details: {
                killer: killEvent.killer.name,
                victim: killEvent.victim.name,
                weapon: killEvent.damageCauserName,
                distance,
              },
            });
          }

          if (killEvent.victim.name === playerName) {
            deaths += 1;
            accountId = accountId ?? killEvent.victim.accountId ?? null;
            placement = this.extractRankFromKillEvent(killEvent) ?? placement;
            deathTimestamp = timestamp ?? deathTimestamp;
            timeline.push({
              time: timestamp ?? Date.now(),
              event: "death",
              position: killEvent.victim.location,
              details: {
                killer: killEvent.killer.name,
                victim: killEvent.victim.name,
                weapon: killEvent.damageCauserName,
                distance: this.toMeters(killEvent.distance),
              },
            });
          }

          assists += killEvent.assists?.filter((assistant) => assistant.name === playerName).length ?? 0;

          break;
        }

        case "LogPlayerTakeDamage": {
          const damageEvent = event as LogPlayerTakeDamage;

          if (damageEvent.attacker && damageEvent.attacker.name === playerName) {
            accountId = accountId ?? damageEvent.attacker.accountId ?? null;
            const damage = damageEvent.damage ?? 0;
            damageDealt += damage;
            shotsHit += 1;
            this.incrementWeaponHits(weaponStats, damageEvent.damageCauserName, damage);
          }

          if (damageEvent.victim && damageEvent.victim.name === playerName) {
            accountId = accountId ?? damageEvent.victim.accountId ?? null;
            damageTaken += damageEvent.damage ?? 0;
            timeline.push({
              time: timestamp ?? Date.now(),
              event: "damage_taken",
              position: damageEvent.victim.location,
              details: {
                killer: damageEvent.attacker?.name,
                victim: damageEvent.victim.name,
                weapon: damageEvent.damageCauserName,
                distance: this.toMeters(damageEvent.distance ?? 0),
                damage: damageEvent.damage ?? 0,
              },
            });
          }

          break;
        }

        case "LogWeaponFireCount": {
          const fireEvent = event as LogWeaponFireCount;
          if (fireEvent.character?.name === playerName) {
            const fired = fireEvent.fireCount ?? 0;
            shotsFired += fired;
            const weaponName = fireEvent.weaponId ?? fireEvent.character.primaryWeaponFirst ?? "Unknown";
            this.incrementWeaponShots(weaponStats, weaponName, fired);
          }
          break;
        }

        case "LogHeal": {
          const healEvent = event as LogHeal;
          if (healEvent.character.name === playerName) {
            healthUsed += healEvent.healAmount ?? 0;
            const itemId = healEvent.item.itemId ?? "Unknown";
            if (!healingItems[itemId]) {
              healingItems[itemId] = { used: 0, time: 0 };
            }
            healingItems[itemId].used += 1;
            healingItems[itemId].time += HEAL_ITEM_DURATIONS[itemId] ?? 0;
            timeline.push({
              time: timestamp ?? Date.now(),
              event: "heal",
              details: {
                item: itemId,
                amount: healEvent.healAmount ?? 0,
              },
            });
          }
          break;
        }

        case "LogItemUse": {
          const itemEvent = event as LogItemUse;
          if (itemEvent.character?.name === playerName && itemEvent.item) {
            const itemId = itemEvent.item.itemId ?? "Unknown";
            if (itemEvent.item.subCategory === "Boost" || itemId.includes("Boost") || itemId.includes("Adrenaline")) {
              boostUsed += 1;
            }
            if (!healingItems[itemId]) {
              healingItems[itemId] = { used: 0, time: 0 };
            }
            healingItems[itemId].used += 1;
            healingItems[itemId].time += HEAL_ITEM_DURATIONS[itemId] ?? 0;
            timeline.push({
              time: timestamp ?? Date.now(),
              event: "item_use",
              details: {
                item: itemId,
              },
            });
          }
          break;
        }

        case "LogVehicleRide": {
          const rideEvent = event as LogVehicleRide;
          if (rideEvent.character.name === playerName) {
            const key = this.getVehicleKey(rideEvent.vehicle);
            if (timestamp !== null) {
              activeVehicleRides.set(key, timestamp);
            }
            timeline.push({
              time: timestamp ?? Date.now(),
              event: "vehicle_enter",
              details: {
                vehicle: key,
              },
            });
          }
          break;
        }

        case "LogVehicleLeave": {
          const leaveEvent = event as LogVehicleLeave;
          if (leaveEvent.character.name === playerName) {
            const key = this.getVehicleKey(leaveEvent.vehicle);
            vehicleDistance += this.toMeters(leaveEvent.rideDistance ?? 0);
            const startTime = activeVehicleRides.get(key);
            if (startTime && timestamp !== null) {
              vehicleTime += (timestamp - startTime) / 1000;
            }
            activeVehicleRides.delete(key);
            timeline.push({
              time: timestamp ?? Date.now(),
              event: "vehicle_exit",
              details: {
                vehicle: key,
                distance: this.toMeters(leaveEvent.rideDistance ?? 0),
              },
            });
          }
          break;
        }

        case "LogSwimStart": {
          const swimStart = event as LogSwimStart;
          if (swimStart.character.name === playerName) {
            activeSwimStart = timestamp ?? activeSwimStart;
          }
          break;
        }

        case "LogSwimEnd": {
          const swimEnd = event as LogSwimEnd;
          if (swimEnd.character.name === playerName) {
            const distance = this.toMeters(swimEnd.swimDistance ?? 0);
            swimDistance += distance;
            if (activeSwimStart && timestamp !== null) {
              const swimDuration = (timestamp - activeSwimStart) / 1000;
              timeline.push({
                time: timestamp,
                event: "swim_end",
                details: {
                  duration: swimDuration,
                  distance,
                },
              });
            }
            activeSwimStart = null;
          }
          break;
        }

        case "LogPlayerRevive": {
          const reviveEvent = event as LogPlayerRevive;
          if (reviveEvent.reviver.name === playerName || reviveEvent.victim.name === playerName) {
            timeline.push({
              time: timestamp ?? Date.now(),
              event: reviveEvent.reviver.name === playerName ? "revive" : "revived",
              details: {
                killer: reviveEvent.reviver.name,
                victim: reviveEvent.victim.name,
              },
            });
          }
          break;
        }

        default:
          break;
      }
    }

    const finalTimestamp = deathTimestamp ?? matchEndTime ?? lastEventTimestamp ?? matchStartTime ?? Date.now();

    if (inBlueZone && lastBlueZoneEntry !== null) {
      timeInBlueZone += (finalTimestamp - lastBlueZoneEntry) / 1000;
    }

    const survivalEnd = deathTimestamp ?? matchEndTime ?? lastEventTimestamp ?? matchStartTime ?? finalTimestamp;
    const survivalTime =
      survivalStart !== null && survivalEnd !== null ? Math.max((survivalEnd - survivalStart) / 1000, 0) : 0;

    const footDistance = Math.max(totalDistance - vehicleDistance - swimDistance, 0);
    const avgKillDistance = kills > 0 ? totalKillDistance / kills : 0;
    const damagePerKill = kills > 0 ? damageDealt / kills : damageDealt;
    const avgSpeed = survivalTime > 0 ? totalDistance / (survivalTime / 60) : 0;
    const headshotPercentage = kills > 0 ? headshotKills / kills : 0;

    const computedWeapons = this.buildWeaponStats(weaponStats);

    timeline.sort((a, b) => a.time - b.time);

    return {
      accountId,
      stats: {
        kills,
        deaths,
        assists,
        damageDealt,
        damageTaken,
        survivalTime,
        placement: placement || (deaths === 0 ? 1 : placement),
        weapons: computedWeapons,
        movement: {
          totalDistance,
          vehicleDistance,
          swimDistance,
          footDistance,
          avgSpeed,
          timeInVehicle: vehicleTime,
          timeInBlueZone,
        },
        healing: {
          healthUsed,
          boostUsed,
          healingItems,
        },
        combat: {
          shotsFired,
          shotsHit,
          headshotPercentage,
          longestKill: longestKillDistance,
          avgKillDistance,
          damagePerKill,
        },
      },
      timeline,
    };
  }

  private createMatchSummary(
    match: Match,
    telemetry: TelemetryEvent[],
    matchStartEvent: LogMatchStart | undefined,
    matchStartTime: number | null,
    matchEndTime: number | null,
  ): MatchSummary {
    const periodicEvents = telemetry.filter(
      (event): event is LogGameStatePeriodic => event._T === "LogGameStatePeriodic" && !!(event as LogGameStatePeriodic).gameState,
    );

    const timelinePoints = periodicEvents.map((event) => {
      const timestamp = this.toTimestamp(event._D);
      const relativeSeconds =
        matchStartTime && timestamp ? Math.max((timestamp - matchStartTime) / 1000, 0) : event.gameState?.elapsedTime ?? 0;

      return {
        time: Math.round(relativeSeconds),
        playersAlive: event.gameState?.numAlivePlayers ?? matchStartEvent?.characters?.length ?? 0,
        zone: {
          radius: this.toMeters(event.gameState?.safetyZoneRadius ?? 0),
          center: {
            x: this.toMeters(event.gameState?.safetyZonePosition?.x ?? 0),
            y: this.toMeters(event.gameState?.safetyZonePosition?.y ?? 0),
          },
        },
      };
    });

    const totalPlayers = matchStartEvent?.characters?.length ?? this.extractTotalPlayersFromMatchStart(matchStartEvent);
    const durationFromMatch = match.attributes.duration ?? null;
    const computedDuration =
      durationFromMatch ??
      (matchStartTime && matchEndTime ? Math.max((matchEndTime - matchStartTime) / 1000, 0) : timelinePoints.at(-1)?.time ?? 0);

    return {
      totalPlayers,
      matchDuration: computedDuration,
      map: match.attributes.mapName,
      gameMode: match.attributes.gameMode,
      timeline: timelinePoints,
    };
  }

  private generateInsights(
    playerAnalyses: PlayerAnalysis[],
    telemetry: TelemetryEvent[],
    matchSummary: MatchSummary,
  ): AnalysisInsights {
    const playerCount = playerAnalyses.length || 1;
    const avgRating =
      playerAnalyses.reduce((sum, player) => sum + player.insights.performanceRating, 0) / playerCount;

    const totalAssists = playerAnalyses.reduce((sum, player) => sum + player.stats.assists, 0);
    const avgSurvival = playerAnalyses.reduce((sum, player) => sum + player.stats.survivalTime, 0) / playerCount;
    const avgDamage = playerAnalyses.reduce((sum, player) => sum + player.stats.damageDealt, 0) / playerCount;

    const teamPerformance = {
      coordination: this.clampRating(totalAssists / playerCount),
      communication: this.clampRating((avgSurvival / Math.max(matchSummary.matchDuration || 1, 1)) * 5),
      strategy: this.clampRating(avgDamage / 300),
      overallRating: avgRating,
    };

    return {
      overallMatchQuality: avgRating,
      keyMoments: this.extractKeyMoments(telemetry),
      teamPerformance,
      strategicInsights: this.generateStrategicInsights(playerAnalyses),
    };
  }

  private generatePlayerInsights(stats: PlayerMatchStats): PlayerInsights {
    const kdRatio = stats.deaths === 0 ? stats.kills : stats.kills / stats.deaths;

    let performanceRating = 3;
    if (kdRatio >= 3) performanceRating = 5;
    else if (kdRatio >= 2) performanceRating = 4;
    else if (kdRatio >= 1.2) performanceRating = 3;
    else if (kdRatio >= 0.8) performanceRating = 2;
    else performanceRating = 1;

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    if (stats.kills >= 5) strengths.push("High kill volume");
    if (stats.damageDealt > 1200) strengths.push("Excellent damage output");
    if (stats.combat.headshotPercentage > 0.35) strengths.push("Consistent headshots");
    if (stats.movement.totalDistance > 6000) strengths.push("Strong map coverage");

    if (stats.deaths > stats.kills) weaknesses.push("Negative kill/death ratio");
    if (stats.movement.timeInBlueZone > 90) weaknesses.push("Too much time spent in blue zone");
    if (stats.healing.boostUsed < 2) weaknesses.push("Limited boost usage");

    if (kdRatio < 1) recommendations.push("Prioritize survival and smarter engagements");
    if (stats.combat.headshotPercentage < 0.2) recommendations.push("Practice precision aiming to secure headshots");
    if (stats.movement.totalDistance < 4000) recommendations.push("Rotate more aggressively to control zones");
    if (stats.healing.boostUsed < 2) recommendations.push("Use boosts to maintain combat readiness");

    return {
      strengths,
      weaknesses,
      recommendations,
      performanceRating,
      improvementAreas: recommendations,
    };
  }

  private generateStrategicInsights(playerAnalyses: PlayerAnalysis[]): string[] {
    const insights: string[] = [];
    const playerCount = playerAnalyses.length || 1;

    const avgSurvival = playerAnalyses.reduce((sum, player) => sum + player.stats.survivalTime, 0) / playerCount;
    if (avgSurvival < 600) {
      insights.push("Team eliminated early — review landing zones and early fights");
    }

    const avgDamage = playerAnalyses.reduce((sum, player) => sum + player.stats.damageDealt, 0) / playerCount;
    if (avgDamage < 500) {
      insights.push("Damage output was low — focus on fight coordination and utility usage");
    }

    const avgBlueZoneTime =
      playerAnalyses.reduce((sum, player) => sum + player.stats.movement.timeInBlueZone, 0) / playerCount;
    if (avgBlueZoneTime > 120) {
      insights.push("Upgrade rotations to avoid extended blue zone exposure");
    }

    return insights;
  }

  private extractKeyMoments(telemetry: TelemetryEvent[]): AnalysisInsights["keyMoments"] {
    const killEvents = telemetry.filter(
      (event): event is LogPlayerKill | LogPlayerKillV2 => event._T === "LogPlayerKill" || event._T === "LogPlayerKillV2",
    );

    return killEvents.slice(0, 10).map((event) => {
      const timestamp = this.toTimestamp(event._D) ?? Date.now();
      const killer = event.killer.name;
      const victim = event.victim.name;

      return {
        timestamp,
        type: "kill",
        description: `${killer} eliminated ${victim}`,
        impact: 5,
        players: [killer, victim],
      };
    });
  }

  private extractTelemetryUrl(match: Match): string {
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
    return matchData.relationships?.assets?.data?.[0]?.attributes?.URL ?? "";
  }

  private incrementWeaponKills(stats: Record<string, WeaponAggregation>, weaponName: string, isHeadshot: boolean): void {
    const weapon = this.ensureWeaponAggregation(stats, weaponName);
    weapon.kills += 1;
    if (isHeadshot) {
      weapon.headshots += 1;
    }
  }

  private incrementWeaponHits(stats: Record<string, WeaponAggregation>, weaponName: string, damage: number): void {
    const weapon = this.ensureWeaponAggregation(stats, weaponName);
    weapon.hits += 1;
    weapon.damage += damage;
  }

  private incrementWeaponShots(stats: Record<string, WeaponAggregation>, weaponName: string, fired: number): void {
    const weapon = this.ensureWeaponAggregation(stats, weaponName);
    weapon.shotsFired += fired;
  }

  private ensureWeaponAggregation(stats: Record<string, WeaponAggregation>, weaponName: string): WeaponAggregation {
    const key = weaponName || "Unknown";
    if (!stats[key]) {
      stats[key] = {
        kills: 0,
        damage: 0,
        hits: 0,
        headshots: 0,
        shotsFired: 0,
      };
    }
    return stats[key];
  }

  private buildWeaponStats(aggregations: Record<string, WeaponAggregation>): WeaponStats {
    const result: WeaponStats = {};
    for (const [weapon, value] of Object.entries(aggregations)) {
      result[weapon] = {
        kills: value.kills,
        damage: value.damage,
        hits: value.hits,
        headshots: value.headshots,
        accuracy: value.shotsFired > 0 ? value.hits / value.shotsFired : 0,
      };
    }
    return result;
  }

  private extractRankFromKillEvent(event: LogPlayerKill | LogPlayerKillV2): number | undefined {
    const eventData = event as unknown as {
      victimGameResult?: {
        stats?: {
          rank?: number;
          winPlace?: number;
        };
      };
    };
    return eventData.victimGameResult?.stats?.rank ?? eventData.victimGameResult?.stats?.winPlace ?? undefined;
  }

  private extractTotalPlayersFromMatchStart(matchStartEvent: LogMatchStart | undefined): number {
    if (!matchStartEvent) {
      return 100;
    }
    return matchStartEvent.characters?.length ?? 100;
  }

  private toTimestamp(value?: string): number | null {
    if (!value) {
      return null;
    }
    const time = Date.parse(value);
    return Number.isNaN(time) ? null : time;
  }

  private toMeters(value: number | undefined): number {
    return (value ?? 0) / 100;
  }

  private calculateDistanceMeters(pos1: TelemetryLocation, pos2: TelemetryLocation): number {
    const distanceCm = Math.sqrt((pos2.x - pos1.x) ** 2 + (pos2.y - pos1.y) ** 2 + (pos2.z - pos1.z) ** 2);
    return distanceCm / 100;
  }

  private getVehicleKey(vehicle: LogVehicleRide["vehicle"] | LogVehicleLeave["vehicle"]): string {
    if (!vehicle) {
      return "unknown";
    }
    return (
      vehicle.vehicleUniqueId?.toString() ??
      vehicle.vehicleId ??
      vehicle.vehicleType ??
      `vehicle-${vehicle.seatIndex ?? 0}`
    );
  }

  private clampRating(value: number): number {
    const scaled = Math.min(Math.max(value, 0), 5);
    return Number.isFinite(scaled) ? scaled : 0;
  }
}
