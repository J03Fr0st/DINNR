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