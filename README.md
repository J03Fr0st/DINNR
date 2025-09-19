# DINNR - PUBG Analytics Platform

[![Angular](https://img.shields.io/badge/Angular-20.3.0-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-ISC-purple.svg)](LICENSE)

**DINNR** is a comprehensive PUBG analytics platform that transforms raw telemetry data into actionable insights for competitive players and squads. Built with Angular 20+ and integrated with the PUBG API through the @j03fr0st/pubg-ts package.

## 🎯 Features

### Core Functionality
- **Match Analysis**: Deep analysis of individual matches using match ID and player names
- **Player Statistics**: Comprehensive performance metrics and historical tracking
- **Telemetry Processing**: Advanced processing of raw PUBG telemetry data
- **Performance Insights**: AI-powered analysis of strengths, weaknesses, and recommendations
- **Visual Analytics**: Interactive charts, timelines, and performance visualizations

### Key Metrics Tracked
- **Combat**: Kills, deaths, assists, damage dealt/taken, weapon effectiveness
- **Movement**: Total distance, vehicle usage, swim distance, blue zone exposure
- **Survival**: Survival time, placement, healing usage, boost management
- **Strategy**: Team coordination, zone control, rotation efficiency

### Data Visualization
- Performance trend charts
- Kill timeline visualization
- Weapon effectiveness analysis
- Movement pattern heatmaps
- Team comparison dashboards

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- NPM or Yarn
- PUBG API key (for full functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/J03Fr0st/DINNR.git
   cd DINNR
   ```

2. **Install dependencies**
   ```bash
   npm install
   npm run install:frontend
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env

   # Edit .env with your PUBG API key
   PUBG_API_KEY=your_api_key_here
   ```

4. **Start Development Server**
   ```bash
   npm start
   ```

   The application will be available at `http://localhost:4200`

### Environment Variables

Create a `.env` file in the project root:

```env
# PUBG API Configuration
PUBG_API_KEY=your_pubg_api_key_here

# Optional: Cache Configuration
CACHE_TTL=3600000
```

## 📊 Usage

### Basic Player Analysis
1. Enter a player name in the search form
2. Click "Analyze" to fetch player data
3. View comprehensive statistics and insights

### Match Analysis
1. Enter a Match ID (GUID format)
2. Add player names for analysis
3. View detailed match telemetry and performance data

### Data Export
- Export analysis results as JSON
- Share performance metrics
- Archive historical data

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Angular 20+ with standalone components
- **Language**: TypeScript 5.9 with strict mode
- **UI Framework**: Angular Material with custom theming
- **Charts**: Chart.js with ng2-charts integration
- **API Integration**: @j03fr0st/pubg-ts for type-safe PUBG API access
- **State Management**: RxJS + Angular Signals
- **Build Tool**: Angular CLI
- **Testing**: Jasmine/Karma for unit tests

### Project Structure
```
DINNR/
├── frontend/                 # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/        # Core services and models
│   │   │   ├── features/    # Feature modules
│   │   │   ├── layout/      # Layout components
│   │   │   └── shared/      # Shared components
│   │   ├── assets/          # Static assets
│   │   └── environments/    # Environment configs
│   ├── angular.json         # Angular CLI config
│   └── package.json        # Frontend dependencies
├── docs/                    # Documentation
├── tests/                   # Test files
└── README.md               # This file
```

### Core Services

#### PubgApiService
- Handles all PUBG API interactions
- Implements caching with configurable TTL
- Provides comprehensive error handling
- Supports rate limiting and retries

#### TelemetryService
- Processes raw PUBG telemetry data
- Extracts meaningful insights from events
- Generates player performance metrics
- Creates match analysis reports

#### AnalysisService
- Orchestrates match analysis workflows
- Combines multiple data sources
- Provides structured analysis results
- Generates AI-powered insights

## 🔧 Development

### Available Scripts

#### Root Project
```bash
npm install                    # Install all dependencies
npm run install:frontend      # Install frontend dependencies only
npm start                     # Start development server
npm run start:local          # Start with local configuration
npm run build                 # Build for development
npm run build:prod           # Build for production
npm run build:local          # Build with local config
npm test                      # Run unit tests
```

#### Frontend (from frontend/ directory)
```bash
ng serve                     # Start Angular development server
ng build                     # Build Angular application
ng test                      # Run unit tests
ng generate component name   # Generate new component
ng lint                      # Run linting
```

### Code Quality
```bash
# Linting and Formatting
npm run lint                 # Run Biome linter
npm run format               # Format code with Biome
npm run check                # Check code quality
```

### Development Workflow
1. **Setup**: Install dependencies and configure environment
2. **Development**: Use `npm start` for hot-reload development
3. **Testing**: Run `npm test` to execute unit tests
4. **Building**: Use `npm run build:prod` for production builds
5. **Linting**: Ensure code quality with `npm run lint`

## 📚 Documentation

- [Product Requirements](docs/PRD.md) - Detailed product specifications
- [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md) - System architecture overview
- [API Design](docs/API_DESIGN.md) - API integration specifications
- [Data Models](docs/DATA_MODELS.md) - TypeScript interfaces and models
- [Component Structure](docs/COMPONENT_STRUCTURE.md) - Component architecture

## 🔍 API Integration

### PUBG API Features
- **Player Lookup**: Search players by name across different shards
- **Match Data**: Retrieve detailed match information and statistics
- **Telemetry Data**: Process raw match telemetry for deep analysis
- **Seasonal Stats**: Access historical seasonal performance data
- **Rate Limiting**: Built-in rate limiting and request management

### Key Endpoints Used
- `players.getPlayerByName()` - Player information lookup
- `matches.getMatch()` - Match details and metadata
- `telemetry.getTelemetryData()` - Raw telemetry event processing
- `players.getPlayerMatches()` - Player match history
- `players.getSeasonStats()` - Seasonal statistics

### Data Processing Pipeline
1. **Data Fetching**: Retrieve data from PUBG API with caching
2. **Telemetry Processing**: Parse and analyze raw telemetry events
3. **Metric Calculation**: Compute performance statistics and insights
4. **Visualization**: Generate charts and visual representations
5. **Export**: Provide data export capabilities

## 🎨 UI/UX Features

### Design System
- Built with Angular Material components
- Custom theme with dark/light mode support
- Responsive design for all screen sizes
- Accessible interface with ARIA support

### Key UI Components
- **Analysis Dashboard**: Central hub for all analytics
- **Performance Charts**: Interactive data visualizations
- **Timeline View**: Chronological event progression
- **Comparison Tools**: Side-by-side player analysis
- **Export Interface**: Data export and sharing

## 🛡️ Security & Privacy

### Data Protection
- API key stored in environment variables
- No sensitive data stored in browser
- Secure communication with PUBG API
- Compliance with PUBG API terms of service

### Rate Limiting
- Built-in rate limiting protection
- Intelligent caching to reduce API calls
- Exponential backoff for failed requests
- User-friendly error handling

## 📈 Performance

### Optimization Strategies
- Efficient data processing algorithms
- Smart caching mechanisms
- Lazy loading of components
- Optimized bundle sizes
- Progressive loading of large datasets

### Benchmarks
- API response time: < 2 seconds
- Page load time: < 3 seconds
- Telemetry processing: < 5 seconds
- Chart rendering: < 1 second

## 🤝 Contributing

### Development Guidelines
1. **Code Style**: Follow existing code patterns and Angular best practices
2. **TypeScript**: Use strict mode and provide proper type definitions
3. **Testing**: Write unit tests for new features and bug fixes
4. **Documentation**: Update documentation for new features
5. **Performance**: Consider performance implications of changes

### Git Workflow
1. Create feature branch from `main`
2. Implement changes with tests
3. Run linting and tests
4. Submit pull request for review
5. Merge after approval

## 🚨 Known Issues

### Current Limitations
- Limited to recent matches (API constraints)
- No offline mode available
- Mobile app in development
- Advanced AI features in progress

### Troubleshooting
- **API Issues**: Verify PUBG API key is valid and not rate-limited
- **Build Errors**: Clear node_modules and reinstall dependencies
- **Performance Issues**: Check browser console for errors
- **Display Issues**: Ensure browser compatibility

## 🔮 Future Roadmap

### Planned Features
- **Squad Analysis**: Multi-player team coordination insights
- **Real-time Updates**: Live match tracking and notifications
- **Mobile Application**: iOS and Android apps
- **Advanced AI**: Machine learning-based strategy recommendations
- **Tournament Integration**: Esports event analysis tools
- **Community Features**: Player profiles and leaderboards

### Technical Enhancements
- **WebAssembly**: Performance-critical telemetry processing
- **PWA**: Offline capabilities and app-like experience
- **Microservices**: Scalable backend architecture
- **Database Integration**: Long-term data storage and analysis

## 📄 License

This project is licensed under the ISC License. See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- **PUBG Corporation** for providing the official API
- **Angular Team** for the excellent framework
- **@j03fr0st** for the comprehensive PUBG TypeScript package
- **Chart.js** team for the powerful visualization library
- **Angular Material** team for the UI component library

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/J03Fr0st/DINNR/issues)
- **Discussions**: [GitHub Discussions](https://github.com/J03Fr0st/DINNR/discussions)
- **Documentation**: [Project Wiki](https://github.com/J03Fr0st/DINNR/wiki)
- **Email**: Contact through GitHub issues

---

**Built with ❤️ for the PUBG community**
