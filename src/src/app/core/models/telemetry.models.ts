export interface TelemetryEvent {
  type: string;
  timestamp: string;
  common: TelemetryCommon;
  [key: string]: any;
}

export interface TelemetryCommon {
  isGame: number;
  matchId: string;
}

export interface Character {
  name: string;
  teamId: number;
  health: number;
  location: Vector3;
  rotation: Vector3;
  velocity: Vector3;
  aiming: boolean;
  firing: boolean;
  ADS: boolean;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface LogPlayerPosition extends TelemetryEvent {
  type: 'LogPlayerPosition';
  character: Character;
  elapsedTime: number;
  numAlivePlayers: number;
}

export interface LogPlayerKill extends TelemetryEvent {
  type: 'LogPlayerKill';
  killer: Character;
  victim: Character;
  assistant?: Character;
  dBNOId?: string;
  damageTypeCategory: string;
  damageCauserName: string;
  distance: number;
  victimGameResult: VictimGameResult;
}

export interface VictimGameResult {
  rank: number;
  stats: ParticipantStats;
}

export interface ParticipantStats {
  DBNOs: number;
  assists: number;
  boosts: number;
  damageDealt: number;
  deathType: string;
  headshotKills: number;
  heals: number;
  killPlace: number;
  killPoints: number;
  killPointsDelta: number;
  kills: number;
  killStreak: number;
  longestKill: number;
  mostDamage: number;
  name: string;
  playerId: string;
  rank: number;
  revives: number;
  rideDistance: number;
  roadKills: number;
  swimDistance: number;
  teamKills: number;
  timeSurvived: number;
  vehicleDestroys: number;
  walkDistance: number;
  weaponsAcquired: number;
  winPlace: number;
  winPoints: number;
  winPointsDelta: number;
}

export function isTelemetryEvent(event: any): event is TelemetryEvent {
  return event && typeof event.type === 'string' && typeof event.timestamp === 'string';
}

export function isPlayerKillEvent(event: TelemetryEvent): event is LogPlayerKill {
  return event.type === 'LogPlayerKill';
}

export function isPlayerPositionEvent(event: TelemetryEvent): event is LogPlayerPosition {
  return event.type === 'LogPlayerPosition';
}