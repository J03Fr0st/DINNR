# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DINNR is a PUBG analytics platform that transforms raw telemetry data into clear, actionable insights for faster improvement and smarter squad calls. The platform is built with Angular and integrates with the PUBG API using the @j03fr0st/pubg-ts package.

## Technology Stack

- **Frontend**: Angular 17+ with TypeScript
- **API Integration**: @j03fr0st/pubg-ts package
- **State Management**: RxJS + Signals
- **UI Framework**: Angular Material
- **Charts**: Chart.js for data visualization
- **Styling**: SCSS with Angular Material theme

## Key Dependencies

- @j03fr0st/pubg-ts: PUBG API wrapper with TypeScript support
- @angular/material: UI components and theming
- rxjs: Reactive programming and state management
- chart.js: Data visualization and charts
- lodash: Utility functions

## Project Structure

```
src/
├── app/
│   ├── core/              # Core services and models
│   │   ├── services/      # API services, telemetry processing
│   │   ├── models/        # TypeScript interfaces and types
│   │   ├── interceptors/  # HTTP interceptors
│   │   └── guards/        # Route guards
│   ├── features/          # Feature modules
│   │   ├── match-analysis/  # Match analysis functionality
│   │   └── shared/        # Shared components and utilities
│   ├── layout/            # Layout components
│   └── app.module.ts      # Root module
├── assets/                # Static assets
└── environments/          # Environment configurations
```

## Common Development Commands

### Project Setup
```bash
npm install
ng serve
```

### Building
```bash
ng build              # Development build
ng build --prod      # Production build
```

### Testing
```bash
ng test              # Unit tests
ng e2e               # End-to-end tests
```

### Linting
```bash
ng lint              # Run linting
ng lint --fix       # Fix linting issues
```

## Core Services

### PubgApiService
- Handles all PUBG API interactions
- Manages rate limiting and caching
- Provides methods for player lookup, match data, and telemetry

### TelemetryService
- Processes raw telemetry data
- Extracts meaningful insights from match events
- Generates analysis and recommendations

### AnalysisService
- Orchestrates match analysis workflows
- Combines multiple data sources
- Provides structured analysis results

## Key Features

### Match Analysis
- Input: Match ID (GUID) and Player Name(s)
- Output: Comprehensive performance metrics and insights
- Features: Kill analysis, movement tracking, weapon effectiveness

### Player Statistics
- Individual performance tracking
- Historical match comparison
- Skill progression metrics

### Data Visualization
- Interactive charts and graphs
- Heat maps for player movement
- Timeline of key events

## API Integration

### PUBG API Usage
- Initialize: `new PubgClient({ apiKey: 'your-key', shard: 'pc-na' })`
- Key methods: `getPlayerByName()`, `getMatch()`, `getTelemetryData()`
- Rate limiting: 10 requests/minute, 600/hour

### Data Processing Pipeline
1. Fetch match data from PUBG API
2. Retrieve telemetry events
3. Process and analyze telemetry
4. Generate insights and visualizations
5. Cache results for performance

## Architecture Patterns

### Component Architecture
- Feature-based module organization
- Smart/dumb component pattern
- Reusable shared components
- Standalone components (Angular 17+)

### State Management
- RxJS for reactive data streams
- Signals for component state
- Service-based state management
- Local storage for persistence

### Data Flow
- Unidirectional data flow
- Observable-based communication
- Immutable state updates
- Centralized error handling

## Performance Considerations

### Caching Strategy
- Local storage for recent analyses
- In-memory caching for API responses
- Consider Redis for shared caching

### Rate Limiting
- Implement exponential backoff
- Cache API responses aggressively
- Queue requests during limit periods

### Data Processing
- Use Web Workers for heavy computations
- Process telemetry in chunks
- Implement progressive loading

## Security

### API Key Management
- Store in environment variables
- Never expose in client code
- Consider backend proxy for production

### Input Validation
- Validate match ID format (GUID)
- Sanitize player names
- Implement proper error handling

## Development Guidelines

### Code Style
- Follow Angular style guide
- Use TypeScript strict mode
- Implement proper error handling
- Write comprehensive tests

### Component Design
- Keep components focused and single-purpose
- Use dependency injection properly
- Implement proper lifecycle hooks
- Follow Angular best practices

### Performance
- Optimize change detection
- Use trackBy for ngFor loops
- Implement lazy loading
- Minimize API calls

## Documentation

- Product Requirements: `docs/PRD.md`
- Technical Architecture: `docs/TECHNICAL_ARCHITECTURE.md`
- API Design: `docs/API_DESIGN.md`
- Data Models: `docs/DATA_MODELS.md`

## Environment Configuration

### Required Environment Variables
```env
PUBG_API_KEY=your_api_key_here
API_BASE_URL=https://api.pubg.com
CACHE_TTL=3600000
```

### Development Environment
- Use Angular CLI for development server
- Mock data for offline development
- Hot module replacement enabled

## Testing Strategy

### Unit Tests
- Test all services and components
- Use Jasmine/Karma framework
- Mock external dependencies

### Integration Tests
- Test component interactions
- Verify data flow
- Test error scenarios

### End-to-End Tests
- Test user workflows
- Verify critical paths
- Use Cypress for testing