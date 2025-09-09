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

export interface GameModeStats {
  assists: number;
  boosts: number;
  dBNOs: number;
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

export interface PlayerRelationships {
  matches?: {
    data: MatchData[];
  };
}

export interface MatchData {
  type: 'match';
  id: string;
}