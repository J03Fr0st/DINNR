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

export interface MatchAnalysisForm {
  matchId: string;
  playerNames: string[];
}

export interface PlayerSearchForm {
  playerName: string;
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

export function calculateDistance(pos1: { x: number; y: number; z: number }, pos2: { x: number; y: number; z: number }): number {
  return Math.sqrt(
    Math.pow(pos2.x - pos1.x, 2) +
    Math.pow(pos2.y - pos1.y, 2) +
    Math.pow(pos2.z - pos1.z, 2)
  );
}