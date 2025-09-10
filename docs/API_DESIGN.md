# DINNR - API Design Document

## 1. Overview

This document outlines the API design for DINNR, including both the external PUBG API integration and internal service APIs for data processing and analysis.

## 2. External API Integration (PUBG API)

### 2.1 Base Configuration
- **Package**: @j03fr0st/pubg-ts (comprehensive PUBG API wrapper)
- **Base URL**: https://api.pubg.com/
- **Authentication**: API Key in headers (handled by the package)
- **Rate Limiting**: 10 requests per minute, 600 per hour (automatic handling)
- **Type Safety**: Full TypeScript support with comprehensive type definitions

### 2.2 Key Endpoints

#### 2.2.1 Players API
```typescript
// Get player by name using @j03fr0st/pubg-ts
const player = await pubgClient.players.getPlayerByName('PlayerName');

// TypeScript interface provided by the package
interface Player {
  id: string;
  type: 'player';
  attributes: PlayerAttributes;
  relationships?: PlayerRelationships;
}

interface PlayerAttributes {
  name: string;
  shardId: string;
  createdAt: string;
  updatedAt: string;
  patchVersion: string;
  titleId: string;
  stats?: PlayerStats;
}
```

#### 2.2.2 Matches API
```typescript
// Get match by ID using @j03fr0st/pubg-ts
const match = await pubgClient.matches.getMatch(matchId);

// TypeScript interface provided by the package
interface Match {
  id: string;
  type: 'match';
  attributes: MatchAttributes;
  relationships: MatchRelationships;
}

interface MatchAttributes {
  createdAt: string;
  duration: number;
  gameMode: string;
  mapName: string;
  patchVersion: string;
  shardId: string;
  stats?: MatchStats;
  titleId: string;
}
```

#### 2.2.3 Telemetry API
```typescript
// Get telemetry data using @j03fr0st/pubg-ts
const telemetry = await pubgClient.telemetry.getTelemetryData(telemetryUrl);

// TypeScript interfaces provided by the package
interface TelemetryEvent {
  type: string;
  timestamp: string;
  common: TelemetryCommon;
  [key: string]: any;
}

interface TelemetryCommon {
  isGame: number;
  matchId: string;
}

// Example event types provided by the package:
// - LogPlayerPosition
// - LogPlayerKill
// - LogMatchStart
// - LogPlayerTakeDamage
// - And many more...
```

## 3. Internal Service APIs

### 3.1 Match Analysis Service

#### 3.1.1 Analyze Match
```typescript
POST /api/v1/match/analyze

Request:
{
  "matchId": "string (GUID)",
  "playerNames": ["string"],
  "shard": "string" // optional, defaults to "pc-na"
}

Response:
{
  "matchId": "string",
  "analysisDate": "ISO8601 timestamp",
  "players": [
    {
      "name": "string",
      "id": "string",
      "stats": {
        "kills": number,
        "deaths": number,
        "assists": number,
        "damageDealt": number,
        "damageTaken": number,
        "survivalTime": number,
        "placement": number,
        "weapons": {
          "weaponName": {
            "kills": number,
            "damage": number,
            "hits": number,
            "headshots": number
          }
        },
        "movement": {
          "totalDistance": number,
          "vehicleDistance": number,
          "swimDistance": number,
          "footDistance": number
        },
        "healing": {
          "healthUsed": number,
          "boostUsed": number
        }
      },
      "insights": {
        "strengths": ["string"],
        "weaknesses": ["string"],
        "recommendations": ["string"]
      }
    }
  ],
  "matchSummary": {
    "totalPlayers": number,
    "matchDuration": number,
    "map": "string",
    "gameMode": "string",
    "timeline": [
      {
        "time": number,
        "playersAlive": number,
        "zone": {
          "radius": number,
          "center": { "x": number, "y": number }
        }
      }
    ]
  }
}
```

#### 3.1.2 Get Player Stats
```typescript
GET /api/v1/players/{playerName}/stats

Response:
{
  "playerName": "string",
  "playerId": "string",
  "overallStats": {
    "matchesPlayed": number,
    "wins": number,
    "kills": number,
    "deaths": number,
    "kdRatio": number,
    "winRate": number,
    "avgDamage": number,
    "avgSurvivalTime": number
  },
  "recentMatches": [
    {
      "matchId": "string",
      "date": "ISO8601 timestamp",
      "placement": number,
      "kills": number,
      "damage": number,
      "survivalTime": number
    }
  ]
}
```

### 3.2 Telemetry Processing Service

#### 3.2.1 Process Telemetry Events
```typescript
POST /api/v1/telemetry/process

Request:
{
  "telemetryUrl": "string",
  "playerNames": ["string"]
}

Response:
{
  "processedEvents": number,
  "analysis": {
    "playerPositions": [
      {
        "playerName": "string",
        "positions": [
          {
            "time": number,
            "x": number,
            "y": number,
            "z": number,
            "eventType": "string"
          }
        ]
      }
    ],
    "killFeed": [
      {
        "time": number,
        "killer": "string",
        "victim": "string",
        "weapon": "string",
        "distance": number,
        "headshot": boolean
      }
    ],
    "damageLog": [
      {
        "time": number,
        "attacker": "string",
        "victim": "string",
        "damage": number,
        "weapon": "string",
        "hitLocation": "string"
      }
    ]
  }
}
```

## 4. Frontend Service Interfaces

### 4.1 PubgApiService Interface
```typescript
interface PubgApiService {
  getPlayerByName(playerName: string): Promise<Player>;
  getMatch(matchId: string): Promise<Match>;
  getTelemetry(telemetryUrl: string): Promise<TelemetryEvent[]>;
  getPlayerMatches(playerId: string): Promise<Match[]>;
}
```

### 4.2 AnalysisService Interface
```typescript
interface AnalysisService {
  analyzeMatch(matchId: string, playerNames: string[]): Promise<MatchAnalysis>;
  getPlayerStats(playerName: string): Promise<PlayerStats>;
  getPlayerHistory(playerName: string): Promise<MatchHistory[]>;
  comparePlayers(playerNames: string[]): Promise<PlayerComparison>;
}
```

### 4.3 VisualizationService Interface
```typescript
interface VisualizationService {
  generateHeatmap(positions: Position[]): HeatmapData;
  generateTimeline(events: TimelineEvent[]): TimelineData;
  generateWeaponStats(stats: WeaponStats): ChartData;
  generateMovementPath(positions: Position[]): PathData;
}
```

## 5. Data Models

### 5.1 Player Model
```typescript
interface Player {
  id: string;
  name: string;
  shard: string;
  createdAt: Date;
  updatedAt: Date;
  stats: PlayerStats;
}
```

### 5.2 Match Model
```typescript
interface Match {
  id: string;
  createdAt: Date;
  duration: number;
  gameMode: string;
  mapName: string;
  shard: string;
  telemetryUrl: string;
  participants: Participant[];
  rosters: Roster[];
}
```

### 5.3 Telemetry Event Model
```typescript
interface TelemetryEvent {
  type: string;
  timestamp: Date;
  [key: string]: any;
}
```

## 6. Error Handling

### 6.1 Error Types
```typescript
enum ErrorType {
  API_ERROR = 'API_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  INVALID_INPUT = 'INVALID_INPUT',
  NOT_FOUND = 'NOT_FOUND',
  PROCESSING_ERROR = 'PROCESSING_ERROR'
}

interface ApiError {
  type: ErrorType;
  message: string;
  details?: any;
  timestamp: Date;
}
```

### 6.2 Error Response Format
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

## 7. Rate Limiting Strategy

### 7.1 Client-side Rate Limiting
- Implement exponential backoff
- Cache API responses
- Limit concurrent requests

### 7.2 Request Queuing
- Queue requests during rate limit periods
- Prioritize user-initiated requests
- Provide feedback to users

## 8. Caching Strategy

### 8.1 Cache Keys
- Player profiles: `player:{playerName}`
- Match data: `match:{matchId}`
- Telemetry: `telemetry:{telemetryUrl}`
- Analysis results: `analysis:{matchId}:{players}`

### 8.2 Cache TTL
- Player profiles: 1 hour
- Match data: 24 hours
- Telemetry: 7 days
- Analysis results: 30 days

## 9. Security Considerations

### 9.1 API Key Management
- Store in environment variables
- Client-side usage with @j03fr0st/pubg-ts package
- Rotate keys regularly
- Monitor usage and implement rate limiting
- Handle CORS and security headers properly

### 9.2 Input Validation
- Validate match ID format (GUID)
- Sanitize player names
- Limit request size

## 10. Performance Optimization

### 10.1 Request Optimization
- Batch multiple player requests
- Use connection pooling
- Implement request deduplication

### 10.2 Data Processing
- Stream large telemetry files
- Process data in chunks
- Use Web Workers for CPU-intensive tasks