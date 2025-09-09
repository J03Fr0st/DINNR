import type { Match, Participant, Player } from '@j03fr0st/pubg-ts';

export interface MatchAnalysis {
  matchId: string;
  analysisDate: string;
  players: PlayerAnalysis[];
  matchSummary: MatchSummary;
  insights: AnalysisInsights;
}

export interface PlayerAnalysis {
  name: string;
  id: string;
  stats: PlayerMatchStats;
  insights: PlayerInsights;
  timeline: PlayerTimeline[];
}

export interface PlayerMatchStats {
  kills: number;
  deaths: number;
  assists: number;
  damageDealt: number;
  damageTaken: number;
  survivalTime: number;
  placement: number;
  weapons: WeaponStats;
  movement: MovementStats;
  healing: HealingStats;
  combat: CombatStats;
}

export interface WeaponStats {
  [weaponName: string]: {
    kills: number;
    damage: number;
    hits: number;
    headshots: number;
    accuracy: number;
  };
}

export interface MovementStats {
  totalDistance: number;
  vehicleDistance: number;
  swimDistance: number;
  footDistance: number;
  avgSpeed: number;
  timeInVehicle: number;
  timeInBlueZone: number;
}

export interface HealingStats {
  healthUsed: number;
  boostUsed: number;
  healingItems: HealingItemStats;
}

export interface HealingItemStats {
  [itemName: string]: {
    used: number;
    time: number;
  };
}

export interface CombatStats {
  shotsFired: number;
  shotsHit: number;
  headshotPercentage: number;
  longestKill: number;
  avgKillDistance: number;
  damagePerKill: number;
}

export interface PlayerInsights {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  performanceRating: number;
  improvementAreas: string[];
}

export interface AnalysisInsights {
  overallMatchQuality: number;
  keyMoments: KeyMoment[];
  teamPerformance: TeamPerformance;
  strategicInsights: string[];
}

export interface KeyMoment {
  timestamp: number;
  type: 'kill' | 'death' | 'revive' | 'escape' | 'zone_close';
  description: string;
  impact: number;
  players: string[];
}

export interface TeamPerformance {
  coordination: number;
  communication: number;
  strategy: number;
  overallRating: number;
}

export interface MatchSummary {
  totalPlayers: number;
  matchDuration: number;
  map: string;
  gameMode: string;
  timeline: TimelinePoint[];
}

export interface TimelinePoint {
  time: number;
  playersAlive: number;
  zone: {
    radius: number;
    center: { x: number; y: number };
  };
}

export interface PlayerTimeline {
  time: number;
  event: string;
  position?: TelemetryLocation;
  details?: any;
}