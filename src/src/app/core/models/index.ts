// Export pubg-ts types

// Export core types from pubg-ts
export type {
  // Player types
  Player,
  PlayerAttributes,
  PlayerSeasonStats,
  GameModeStats,
  MatchReference,
  PlayersResponse,
  PlayerSeasonStatsResponse,
} from '@j03fr0st/pubg-ts';

// Export match types
export type {
  Match,
  MatchAttributes,
  MatchRelationships,
  Roster,
  RosterAttributes,
  RosterStats,
  RosterRelationships,
  Participant,
  ParticipantAttributes,
  ParticipantStats,
  ParticipantRelationships,
  Asset,
  AssetAttributes,
  MatchResponse,
  MatchesResponse,
} from '@j03fr0st/pubg-ts';

// Export telemetry types
export type {
  TelemetryEvent,
  Location,
  LogPlayerKill,
  LogPlayerPosition,
  LogPlayerTakeDamage,
  LogMatchStart,
  LogMatchEnd,
  TelemetryData,
} from '@j03fr0st/pubg-ts';

// Export common types
export type {
  ApiResponse,
  SingleApiResponse,
  ResourceComplete,
  Shard,
  GameMode,
  MapName,
} from '@j03fr0st/pubg-ts';

// Export asset types
export type {
  EnhancedItemInfo,
  EnhancedSeasonInfo,
  EnhancedVehicleInfo,
  SurvivalTitleInfo,
} from '@j03fr0st/pubg-ts';

// Export enums
export type {
  AttackType,
  CarryState,
  DamageReason,
  ObjectType,
  ObjectTypeStatus,
  RegionIdChimera_Main,
  RegionIdDesert_Main,
  RegionIdDihorOtok_Main,
  RegionIdErangel_Main,
  RegionIdHeaven_Main,
  RegionIdSavage_Main,
  RegionIdSummerland_Main,
  RegionIdTiger_Main,
  WeatherId,
} from '@j03fr0st/pubg-ts';

// Export item types
export type {
  ITEM_DICTIONARY,
  ItemId,
} from '@j03fr0st/pubg-ts';

// Export map types
export type {
  MAP_DICTIONARY,
  MapId,
  MapName as AssetMapName,
} from '@j03fr0st/pubg-ts';

// Export season types
export type {
  Platform as AssetPlatform,
  SEASONS_DATA,
  SeasonAttributes as AssetSeasonAttributes,
  SeasonData,
  SeasonsData,
} from '@j03fr0st/pubg-ts';

// Export vehicle types
export type {
  VEHICLE_DICTIONARY,
  VehicleId,
} from '@j03fr0st/pubg-ts';

// Keep custom analysis models since they're specific to our application
export * from './analysis.models';
export * from './ui.models';