import { Injectable } from "@angular/core";
import type { MatchAnalysis, PlayerAnalysis } from "../models";

export interface HeatmapCell {
  id: string;
  x: number;
  y: number;
  count: number;
  intensity: number;
}

export interface PerformanceMetric {
  metric: string;
  value: number;
  unit?: string;
  normalized: number;
}

export interface KillTimelineItem {
  time: string;
  description: string;
  players: string[];
  impact: number;
}

export interface PlayerComparisonItem {
  player: string;
  kills: number;
  damage: number;
  survivalTime: number;
  kdRatio: number;
}

export interface WeaponUsageItem {
  weapon: string;
  kills: number;
  damage: number;
  accuracy: number;
}

@Injectable({
  providedIn: "root",
})
export class VisualizationService {
  generateHeatmapData(players: PlayerAnalysis[], limit = 12): HeatmapCell[] {
    const bucketSize = 20000;
    const buckets = new Map<string, { x: number; y: number; count: number }>();

    for (const player of players) {
      for (const event of player.timeline) {
        if (!event.position) {
          continue;
        }
        const bucketX = Math.round(event.position.x / bucketSize) * bucketSize;
        const bucketY = Math.round(event.position.y / bucketSize) * bucketSize;
        const key = bucketX + ":" + bucketY;
        const entry = buckets.get(key) ?? { x: bucketX, y: bucketY, count: 0 };
        entry.count += 1;
        buckets.set(key, entry);
      }
    }

    const cells = Array.from(buckets.values());
    cells.sort((a, b) => b.count - a.count);
    const topCells = cells.slice(0, limit);
    const maxCount = topCells[0]?.count ?? 1;

    return topCells.map((cell, index) => ({
      id: [cell.x, cell.y, index].join(":"),
      x: Math.round(cell.x / 100) / 10,
      y: Math.round(cell.y / 100) / 10,
      count: cell.count,
      intensity: cell.count / maxCount,
    }));
  }

  buildKillTimeline(analysis: MatchAnalysis): KillTimelineItem[] {
    return analysis.insights.keyMoments
      .slice()
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((moment) => ({
        time: new Date(moment.timestamp).toLocaleTimeString(),
        description: moment.description,
        players: moment.players,
        impact: moment.impact,
      }));
  }

  buildPerformanceMetrics(analysis: MatchAnalysis): PerformanceMetric[] {
    const playerCount = analysis.players.length || 1;
    const totalKills = analysis.players.reduce((sum, player) => sum + player.stats.kills, 0);
    const totalDamage = analysis.players.reduce((sum, player) => sum + player.stats.damageDealt, 0);
    const avgSurvival = analysis.players.reduce((sum, player) => sum + player.stats.survivalTime, 0) / playerCount;
    const avgPlacement = analysis.players.reduce((sum, player) => sum + player.stats.placement, 0) / playerCount;

    const targetKills = Math.max(playerCount * 5, 1);
    const targetDamage = Math.max(playerCount * 1500, 1);
    const targetSurvival = Math.max(analysis.matchSummary.matchDuration || 1500, 1);
    const placementScore = 1 - Math.min(Math.max(avgPlacement - 1, 0) / 10, 1);

    return [
      {
        metric: "Total Kills",
        value: totalKills,
        normalized: Math.min(totalKills / targetKills, 1),
      },
      {
        metric: "Total Damage",
        value: Math.round(totalDamage),
        normalized: Math.min(totalDamage / targetDamage, 1),
      },
      {
        metric: "Avg Survival",
        value: Math.round(avgSurvival),
        unit: "s",
        normalized: Math.min(avgSurvival / targetSurvival, 1),
      },
      {
        metric: "Avg Placement",
        value: Number(avgPlacement.toFixed(1)),
        normalized: placementScore,
      },
    ];
  }

  buildPlayerComparison(analysis: MatchAnalysis): PlayerComparisonItem[] {
    return analysis.players.map((player) => {
      const kdRatio = player.stats.deaths === 0 ? player.stats.kills : player.stats.kills / player.stats.deaths;
      return {
        player: player.name,
        kills: player.stats.kills,
        damage: Math.round(player.stats.damageDealt),
        survivalTime: Math.round(player.stats.survivalTime),
        kdRatio: Number(kdRatio.toFixed(2)),
      };
    });
  }

  buildWeaponUsage(players: PlayerAnalysis[]): WeaponUsageItem[] {
    const weaponMap = new Map<string, { kills: number; damage: number; accuracyTotal: number; entries: number }>();

    players.forEach((player) => {
      const weapons = player.stats.weapons ?? {};
      for (const [weaponName, stats] of Object.entries(weapons)) {
        const record = weaponMap.get(weaponName) ?? { kills: 0, damage: 0, accuracyTotal: 0, entries: 0 };
        record.kills += stats.kills ?? 0;
        record.damage += stats.damage ?? 0;
        record.accuracyTotal += stats.accuracy ?? 0;
        record.entries += 1;
        weaponMap.set(weaponName, record);
      }
    });

    const usage = Array.from(weaponMap.entries()).map(([weapon, value]) => ({
      weapon,
      kills: value.kills,
      damage: Math.round(value.damage),
      accuracy: value.entries > 0 ? Number((value.accuracyTotal / value.entries).toFixed(2)) : 0,
    }));

    usage.sort((a, b) => b.kills - a.kills || b.damage - a.damage);
    return usage.slice(0, 10);
  }
}
