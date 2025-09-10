# DINNR - Technical Architecture Document

## 1. System Overview

DINNR is a single-page application built with Angular that integrates with the PUBG API through the @j03fr0st/pubg-ts package to provide comprehensive match analysis and player statistics.

## 2. Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Angular App   │    │  Node.js API    │    │   PUBG API      │
│   (Frontend)    │◄──►│   (Optional)    │◄──►│   (External)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Local Storage │    │   Redis Cache   │    │   Database      │
│   (Browser)     │    │   (Optional)    │    │   (Optional)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 3. Technology Stack

### 3.1 Frontend
- **Framework**: Angular 17+ with standalone components
- **Language**: TypeScript 5.x
- **State Management**: RxJS + Signals
- **UI Framework**: Angular Material
- **Charts**: Chart.js or ngx-charts
- **Styling**: SCSS with Angular Material theme
- **Build Tool**: Angular CLI

### 3.2 Architecture Approach
- **Client-Side Focus**: Direct PUBG API integration from Angular frontend
- **No Backend Required**: Eliminates server infrastructure complexity
- **Type Safety**: Full TypeScript integration with @j03fr0st/pubg-ts
- **Caching Strategy**: Browser-based storage and in-memory caching

### 3.3 Key Libraries
- @j03fr0st/pubg-ts: Complete PUBG API wrapper with comprehensive TypeScript types
- @angular/material: UI components and theming
- rxjs: Reactive programming and state management
- chart.js: Data visualization and charts
- lodash: Utility functions and helpers

## 4. Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   ├── pubg-api.service.ts
│   │   │   ├── telemetry.service.ts
│   │   │   └── storage.service.ts
│   │   ├── models/
│   │   │   ├── pubg-api.models.ts
│   │   │   ├── telemetry.models.ts
│   │   │   └── ui.models.ts
│   │   ├── interceptors/
│   │   │   └── error.interceptor.ts
│   │   └── guards/
│   │       └── auth.guard.ts
│   ├── features/
│   │   ├── match-analysis/
│   │   │   ├── components/
│   │   │   │   ├── match-input/
│   │   │   │   ├── player-stats/
│   │   │   │   ├── telemetry-visualization/
│   │   │   │   └── performance-metrics/
│   │   │   ├── services/
│   │   │   │   └── match-analysis.service.ts
│   │   │   └── match-analysis.module.ts
│   │   └── shared/
│   │       ├── components/
│   │       │   ├── loading-spinner/
│   │       │   ├── error-message/
│   │       │   └── data-card/
│   │       ├── directives/
│   │       │   └── auto-unsubscribe.directive.ts
│   │       └── pipes/
│   │           └── duration.pipe.ts
│   ├── layout/
│   │   ├── components/
│   │   │   ├── header/
│   │   │   ├── sidebar/
│   │   │   └── footer/
│   │   └── layout.module.ts
│   └── app.module.ts
├── assets/
│   ├── images/
│   └── styles/
└── environments/
    ├── environment.ts
    └── environment.prod.ts
```

## 5. Core Services

### 5.1 PubgApiService
```typescript
@Injectable({ providedIn: 'root' })
export class PubgApiService {
  private client: PubgClient;
  
  constructor() {
    this.client = new PubgClient({
      apiKey: environment.pubgApiKey,
      shard: 'pc-na'
    });
  }
  
  async getPlayerByName(playerName: string): Promise<Player> {
    return this.client.players.getPlayerByName(playerName);
  }
  
  async getMatch(matchId: string): Promise<Match> {
    return this.client.matches.getMatch(matchId);
  }
  
  async getTelemetry(telemetryUrl: string): Promise<TelemetryEvent[]> {
    return this.client.telemetry.getTelemetryData(telemetryUrl);
  }
  
  async getPlayerMatches(playerId: string): Promise<Match[]> {
    return this.client.players.getPlayerMatches(playerId);
  }
  
  async getSeasonStats(playerId: string, seasonId: string): Promise<SeasonStats> {
    return this.client.players.getSeasonStats(playerId, seasonId);
  }
}
```

### 5.2 TelemetryService
```typescript
@Injectable({ providedIn: 'root' })
export class TelemetryService {
  constructor(private pubgApiService: PubgApiService) {}
  
  async analyzeMatch(matchId: string, playerNames: string[]): Promise<MatchAnalysis> {
    const match = await this.pubgApiService.getMatch(matchId);
    const telemetry = await this.pubgApiService.getTelemetry(match.telemetryUrl);
    
    return this.processTelemetry(telemetry, playerNames);
  }
  
  private processTelemetry(telemetry: TelemetryEvent[], playerNames: string[]): MatchAnalysis {
    // Process telemetry events to extract insights
    // Implementation details...
  }
}
```

## 6. Data Flow

### 6.1 Match Analysis Flow
1. User inputs Match ID and Player Name(s)
2. Frontend validates input
3. Call PubgApiService to fetch match data
4. Fetch telemetry data from telemetry URL
5. Process telemetry to extract insights
6. Transform data for visualization
7. Display results in UI components

### 6.2 Data Processing Pipeline
```
Raw Telemetry → Event Processing → Data Aggregation → Visualization → User Interface
```

## 7. Performance Considerations

### 7.1 Caching Strategy
- Local storage for recent match analyses
- Memory cache for frequent player lookups
- Optional Redis for shared caching

### 7.2 Rate Limiting
- Implement exponential backoff for API calls
- Cache responses to minimize API calls
- User-level rate limiting

### 7.3 Data Processing
- Web Workers for heavy telemetry processing
- Chunked processing for large datasets
- Progressive UI updates

## 8. Security Considerations

### 8.1 API Key Management
- Store API key in environment variables
- Client-side API key usage with @j03fr0st/pubg-ts
- Implement proper CORS headers and security measures
- Consider API key rotation and monitoring

### 8.2 Data Privacy
- Don't store sensitive user data
- Clear cache periodically
- Implement data retention policies

## 9. Deployment Strategy

### 9.1 Frontend Deployment
- Static hosting on Firebase/Vercel/Netlify
- CDN for assets
- SSL/HTTPS enforced
- No backend infrastructure required

### 9.2 Future Backend Considerations (Optional)
- If backend is needed for scaling:
  - Docker containers
  - Kubernetes for scaling
  - Load balancing

## 10. Monitoring and Logging

### 10.1 Frontend Monitoring
- Error tracking with Sentry
- Performance metrics
- User behavior analytics

### 10.2 API Monitoring
- API call logging
- Error monitoring
- Performance metrics
- Rate limiting tracking

## 11. Scaling Strategy

### 11.1 Vertical Scaling
- Optimize data processing algorithms
- Implement efficient caching
- Reduce API calls

### 11.2 Horizontal Scaling
- Load balancer for multiple instances
- Database sharding
- Distributed caching

## 12. Development Environment

### 12.1 Local Development
- Angular CLI for development server
- Hot module replacement
- Mock data for development

### 12.2 Testing
- Unit tests with Jasmine/Karma
- Integration tests
- End-to-end tests with Cypress

### 12.3 CI/CD
- GitHub Actions or similar
- Automated testing
- Automated deployment