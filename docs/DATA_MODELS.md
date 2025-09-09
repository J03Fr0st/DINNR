# DINNR - Data Model Documentation

## 1. Overview

This document defines the data models used throughout the DINNR application, including interfaces for PUBG API responses, internal data structures, and UI components.

## 2. Core Data Models

### 2.1 Player Models

#### 2.1.1 Player Interface
```typescript
export interface Player {
  id: string;
  type: 'player';
  attributes: PlayerAttributes;
  relationships?: PlayerRelationships;
}

export interface PlayerAttributes {
  name: string;
  shardId: string;
  createdAt: string;
  updatedAt: string;
  patchVersion: string;
  titleId: string;
  stats?: PlayerStats;
}

export interface PlayerStats {
  ranked?: {
    gameModeStats: {
      solo?: GameModeStats;
      duo?: GameModeStats;
      squad?: GameModeStats;
    };
  };
}
```

#### 2.1.2 Game Mode Stats
```typescript
export interface GameModeStats {
  assists: number;
  boosts: number;
  dBNOs: number; // Down But Not Out
  dailyKills: number;
  dailyWins: number;
  damageDealt: number;
  daysPlayed: number;
  headshotKills: number;
  heals: number;
  killPoints: number;
  kills: number;
  losses: number;
  longestKill: number;
  longestKillStreak: number;
  matchesPlayed: number;
  rankPoints: number;
  revives: number;
  rideDistance: number;
  roadKills: number;
  roundMostKills: number;
  squadKills: number;
  suicides: number;
  swimDistance: number;
  teamKills: number;
  timeSurvived: number;
  top10s: number;
  vehicleDestroys: number;
  walkDistance: number;
  weaponsAcquired: number;
  weeklyKills: number;
  weeklyWins: number;
  winPoints: number;
  wins: number;
}
```

### 2.2 Match Models

#### 2.2.1 Match Interface
```typescript
export interface Match {
  id: string;
  type: 'match';
  attributes: MatchAttributes;
  relationships: MatchRelationships;
}

export interface MatchAttributes {
  createdAt: string;
  duration: number;
  gameMode: string;
  mapName: string;
  patchVersion: string;
  shardId: string;
  stats?: MatchStats;
  titleId: string;
}

export interface MatchStats {
  deathType: string;
  killerAccountId?: string;
  killerName?: string;
  victimAccountId?: string;
  victimName?: string;
  victimGameId?: string;
  victimRanking?: number;
  victimTeamRanking?: number;
}
```

#### 2.2.2 Match Relationships
```typescript
export interface MatchRelationships {
  rosters: {
    data: RosterData[];
  };
  participants: {
    data: ParticipantData[];
  };
  assets: {
    data: AssetData[];
  };
}

export interface RosterData {
  type: 'roster';
  id: string;
}

export interface ParticipantData {
  type: 'participant';
  id: string;
}

export interface AssetData {
  type: 'asset';
  id: string;
  attributes: AssetAttributes;
}

export interface AssetAttributes {
  name: string;
  URL: string;
  description?: string;
  createdAt?: string;
  fileSize?: number;
}
```

### 2.3 Participant Models

#### 2.3.1 Participant Interface
```typescript
export interface Participant {
  id: string;
  type: 'participant';
  attributes: ParticipantAttributes;
  relationships?: ParticipantRelationships;
  stats?: ParticipantStats;
}

export interface ParticipantAttributes {
  actor?: string;
  shardId: string;
  stats?: ParticipantStats;
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

export interface ParticipantRelationships {
  player?: {
    data: PlayerData;
  };
  roster?: {
    data: RosterData;
  };
}

export interface PlayerData {
  type: 'player';
  id: string;
}
```

### 2.4 Telemetry Models

#### 2.4.1 Telemetry Event Base
```typescript
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
```

#### 2.4.2 Key Telemetry Event Types

##### LogPlayerPosition
```typescript
export interface LogPlayerPosition extends TelemetryEvent {
  type: 'LogPlayerPosition';
  character: Character;
  elapsedTime: number;
  numAlivePlayers: number;
}
```

##### LogPlayerKill
```typescript
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
```

##### LogMatchStart
```typescript
export interface LogMatchStart extends TelemetryEvent {
  type: 'LogMatchStart';
  characters: Character[];
  cameraViewBehaviour: string;
  teamSize: number;
  isCustomGame: number;
  isEventMode: number;
  blueZoneCustomOptions: BlueZoneCustomOptions;
}

export interface BlueZoneCustomOptions {
  showOnMap: number;
  phaseNum: number;
  startDelay: number;
  warningDuration: number;
  releaseDuration: number;
  damageDuration: number;
  radius: number;
  lpRadius: number;
  lpSpeed: number;
  spreadRatio: number;
}
```

## 3. Internal Application Models

### 3.1 Analysis Models

#### 3.1.1 Match Analysis
```typescript
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
```

#### 3.1.2 Player Insights
```typescript
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
```

### 3.2 UI Models

#### 3.2.1 Chart Data Models
```typescript
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean;
}

export interface TimelineData {
  time: number;
  value: number;
  event?: string;
  players?: string[];
}

export interface HeatmapData {
  x: number;
  y: number;
  value: number;
  count: number;
}
```

#### 3.2.2 Form Models
```typescript
export interface MatchAnalysisForm {
  matchId: string;
  playerNames: string[];
  shard: string;
}

export interface PlayerSearchForm {
  playerName: string;
  shard: string;
}

export interface FilterOptions {
  gameMode: string[];
  mapName: string[];
  timeRange: {
    start: string;
    end: string;
  };
  minKills: number;
  maxKills: number;
}
```

## 4. Type Definitions

### 4.1 Game Enums
```typescript
export enum GameMode {
  SOLO = 'solo',
  DUO = 'duo',
  SQUAD = 'squad',
  SOLO_FPP = 'solo-fpp',
  DUO_FPP = 'duo-fpp',
  SQUAD_FPP = 'squad-fpp'
}

export enum MapName {
  ERANGEL = 'Erangel',
  MIRAMAR = 'Miramar',
  SANHOK = 'Sanhok',
  VIKENDI = 'Vikendi',
  DESTON = 'Deston',
  HAVEN = 'Haven'
}

export enum Shard {
  PC_NA = 'pc-na',
  PC_EU = 'pc-eu',
  PC_AS = 'pc-as',
  PC_KAKAO = 'pc-kakao',
  PC_SEA = 'pc-sea',
  PC_KRJP = 'pc-krjp',
  PC_JP = 'pc-jp',
  PC_OC = 'pc-oc',
  PC_SA = 'pc-sa',
  PC_RU = 'pc-ru'
}
```

### 4.2 Analysis Enums
```typescript
export enum PerformanceRating {
  EXCELLENT = 5,
  GOOD = 4,
  AVERAGE = 3,
  BELOW_AVERAGE = 2,
  POOR = 1
}

export enum InsightType {
  STRENGTH = 'strength',
  WEAKNESS = 'weakness',
  RECOMMENDATION = 'recommendation'
}

export enum EventType {
  KILL = 'kill',
  DEATH = 'death',
  REVIVE = 'revive',
  POSITION_CHANGE = 'position_change',
  DAMAGE_DEALT = 'damage_dealt',
  DAMAGE_TAKEN = 'damage_taken',
  HEALING = 'healing',
  BOOSTING = 'boosting',
  VEHICLE_ENTER = 'vehicle_enter',
  VEHICLE_EXIT = 'vehicle_exit'
}
```

## 5. Utility Types

### 5.1 Type Guards
```typescript
export function isTelemetryEvent(event: any): event is TelemetryEvent {
  return event && typeof event.type === 'string' && typeof event.timestamp === 'string';
}

export function isPlayerKillEvent(event: TelemetryEvent): event is LogPlayerKill {
  return event.type === 'LogPlayerKill';
}

export function isPlayerPositionEvent(event: TelemetryEvent): event is LogPlayerPosition {
  return event.type === 'LogPlayerPosition';
}
```

### 5.2 Utility Functions
```typescript
export function calculateKD(kills: number, deaths: number): number {
  return deaths === 0 ? kills : kills / deaths;
}

export function calculateWinRate(wins: number, matches: number): number {
  return matches === 0 ? 0 : (wins / matches) * 100;
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function calculateDistance(pos1: Vector3, pos2: Vector3): number {
  return Math.sqrt(
    Math.pow(pos2.x - pos1.x, 2) +
    Math.pow(pos2.y - pos1.y, 2) +
    Math.pow(pos2.z - pos1.z, 2)
  );
}
```