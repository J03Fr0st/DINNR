# DINNR - Component Structure Documentation

## 1. Overview

This document outlines the component architecture for the DINNR Angular application, including standalone components, feature modules, and shared utilities.

## 2. Component Architecture

### 2.1 Component Categories

#### **Feature Components**
Located in `frontend/src/app/features/`
- Business logic and user-facing features
- Feature-specific functionality
- Independent modules with clear responsibilities

#### **Shared Components**
Located in `frontend/src/app/features/shared/`
- Reusable UI elements
- Cross-feature utilities
- Common functionality

#### **Layout Components**
Located in `frontend/src/app/layout/`
- Application shell and navigation
- Header, footer, sidebar
- Structural elements

### 2.2 Component Hierarchy

```
AppComponent (Root)
├── LayoutModule
│   ├── HeaderComponent
│   ├── SidebarComponent
│   └── FooterComponent
├── Features
│   ├── HomeFeature
│   │   └── HomeComponent
│   └── MatchAnalysisFeature
│       ├── MatchInputComponent
│       ├── PlayerStatsComponent
│       ├── MatchSummaryComponent
│       ├── InsightsComponent
│       ├── PerformanceChartComponent
│       ├── KillTimelineComponent
│       └── TeamComparisonComponent
└── Shared
    ├── LoadingSpinnerComponent
    ├── ErrorMessageComponent
    └── DataCardComponent
```

## 3. Feature Components

### 3.1 Match Analysis Feature

#### **MatchInputComponent**
**Location**: `frontend/src/app/features/match-analysis/components/match-input/`
**Purpose**: Input form for match ID and player name entry
**Key Features**:
- Reactive form validation
- Real-time player search via PUBG API
- Player statistics calculation from recent matches
- Export functionality for analysis data

```typescript
// Key Input Properties
@Input() initialPlayerName?: string;
@Input() initialMatchId?: string;

// Key Output Events
@Output() analysisComplete = new EventEmitter<MatchAnalysis>();
@Output() error = new EventEmitter<Error>();

// Core Methods
onSubmit(): void // Handles form submission
exportAnalysis(): void // Exports analysis to JSON
resetForm(): void // Clears form and analysis
```

**Dependencies**:
- `PubgApiService` for API calls
- `FormBuilder` for reactive forms
- `MatSnackBar` for notifications

**UI Components Used**:
- Angular Material Form Fields
- Angular Material Inputs
- Angular Material Buttons
- Angular Material Progress Spinner

#### **PlayerStatsComponent**
**Location**: `frontend/src/app/features/match-analysis/components/player-stats/`
**Purpose**: Display comprehensive player statistics and performance metrics
**Key Features**:
- Player analysis display with performance ratings
- Weapon statistics and effectiveness metrics
- Movement and healing data visualization
- Color-coded performance indicators

```typescript
// Key Input Properties
@Input() players: PlayerAnalysis[] = [];

// Helper Methods
getPerformanceColor(rating: number): string // Returns color based on rating
getPerformanceText(rating: number): string // Returns text description
formatTime(seconds: number): string // Formats time display
formatDistance(meters: number): string // Formats distance display
getKDColor(kd: number): string // Returns K/D ratio color
```

**UI Components Used**:
- Angular Material Cards
- Angular Material Chips
- Angular Material Icons

#### **MatchSummaryComponent**
**Location**: `frontend/src/app/features/match-analysis/components/match-summary/`
**Purpose**: Display overall match information and summary statistics
**Key Features**:
- Match metadata (map, mode, duration)
- Timeline of key events
- Zone progression visualization
- Team composition overview

#### **InsightsComponent**
**Location**: `frontend/src/app/features/match-analysis/components/insights/`
**Purpose**: Display AI-generated insights and recommendations
**Key Features**:
- Performance analysis insights
- Strength and weakness identification
- Strategic recommendations
- Team coordination assessment

#### **PerformanceChartComponent**
**Location**: `frontend/src/app/features/match-analysis/components/performance-chart/`
**Purpose**: Visualize performance data through charts and graphs
**Key Features**:
- Performance trend charts
- Kill/death ratio visualization
- Damage output graphs
- Movement pattern visualization

**Dependencies**:
- Chart.js for charting
- `ng2-charts` for Angular integration

#### **KillTimelineComponent**
**Location**: `frontend/src/app/features/match-analysis/components/kill-timeline/`
**Purpose**: Display chronological timeline of kills and key events
**Key Features**:
- Event timeline with timestamps
- Kill information display
- Weapon and distance data
- Interactive timeline navigation

#### **TeamComparisonComponent**
**Location**: `frontend/src/app/features/match-analysis/components/team-comparison/`
**Purpose**: Compare performance between multiple players
**Key Features**:
- Side-by-side player comparison
- Performance metrics comparison
- Team coordination analysis
- Relative performance assessment

### 3.2 Home Feature

#### **HomeComponent**
**Location**: `frontend/src/app/features/home/`
**Purpose**: Application landing page and navigation hub
**Key Features**:
- Welcome and introduction
- Quick analysis options
- Recent analysis history
- Feature navigation

## 4. Shared Components

### 4.1 LoadingSpinnerComponent
**Location**: `frontend/src/app/features/shared/components/loading-spinner/`
**Purpose**: Display loading state during asynchronous operations
**Key Features**:
- Configurable spinner size and color
- Loading message display
- Overlay or inline display options

```typescript
// Key Input Properties
@Input() isLoading = false;
@Input() message?: string;
@Input() size: 'small' | 'medium' | 'large' = 'medium';
@Input() overlay = false;
```

### 4.2 ErrorMessageComponent
**Location**: `frontend/src/app/features/shared/components/error-message/`
**Purpose**: Display error messages with recovery options
**Key Features**:
- Error message display
- Retry functionality
- Error type categorization
- Action buttons for recovery

```typescript
// Key Input Properties
@Input() error?: Error | string;
@Input() retry?: () => void;
@Input() actionText = 'Retry';
@Input() dismissible = true;
```

### 4.3 DataCardComponent
**Location**: `frontend/src/app/features/shared/components/data-card/`
**Purpose**: Reusable card component for data display
**Key Features**:
- Configurable card layout
- Header and footer options
- Loading and error states
- Responsive design

```typescript
// Key Input Properties
@Input() title?: string;
@Input() subtitle?: string;
@Input() loading = false;
@Input() error?: string;
@Input() actions: CardAction[] = [];
```

## 5. Layout Components

### 5.1 HeaderComponent
**Location**: `frontend/src/app/layout/components/header/`
**Purpose**: Application header with navigation and user controls
**Key Features**:
- Application branding
- Navigation menu
- User account controls
- Search functionality

### 5.2 SidebarComponent
**Location**: `frontend/src/app/layout/components/sidebar/`
**Purpose**: Side navigation menu and quick actions
**Key Features**:
- Feature navigation
- Quick action buttons
- Collapsible sidebar
- Contextual menu items

### 5.3 FooterComponent
**Location**: `frontend/src/app/layout/components/footer/`
**Purpose**: Application footer with links and information
**Key Features**:
- Copyright information
- External links
- Contact information
- Version display

## 6. Component Patterns

### 6.1 Standalone Components
All components follow Angular 17+ standalone component pattern:
```typescript
@Component({
  selector: 'app-component-name',
  templateUrl: './component-name.component.html',
  styleUrls: ['./component-name.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // Other required modules
  ],
})
export class ComponentNameComponent {
  // Component logic
}
```

### 6.2 Input/Output Pattern
Components use strongly-typed inputs and outputs:
```typescript
@Input() data: DataType;
@Output() dataChange = new EventEmitter<DataType>();
```

### 6.3 Reactive Forms Pattern
Form components use reactive forms with validation:
```typescript
private form = this.fb.group({
  field: ['', [Validators.required]],
});
```

### 6.4 Service Injection Pattern
Components inject required services via constructor:
```typescript
constructor(
  private apiService: ApiService,
  private snackBar: MatSnackBar
) {}
```

## 7. Styling and Theming

### 7.1 Component Styling
- Each component has its own SCSS file
- Uses Angular Material theming
- Supports responsive design
- Implements dark/light theme support

### 7.2 Common Styles
- Located in `frontend/src/assets/styles/`
- Global application styles
- Angular Material theme overrides
- Responsive design patterns

## 8. Component Testing

### 8.1 Unit Testing
- Each component has corresponding `.spec.ts` file
- Uses Jasmine testing framework
- Tests component behavior and rendering
- Mocks dependencies appropriately

### 8.2 Integration Testing
- Component interaction testing
- Service integration testing
- End-to-end user flow testing

## 9. Performance Considerations

### 9.1 Change Detection
- Uses `OnPush` change detection where appropriate
- Implements `trackBy` for *ngFor loops
- Minimizes unnecessary re-renders

### 9.2 Lazy Loading
- Feature modules are lazy-loaded
- Components loaded on demand
- Optimized bundle sizes

### 9.3 Memory Management
- Proper cleanup of subscriptions
- Efficient data handling
- Optimized component lifecycle

## 10. Accessibility

### 10.1 ARIA Support
- Proper ARIA labels and attributes
- Keyboard navigation support
- Screen reader compatibility

### 10.2 Focus Management
- Proper focus trapping
- Keyboard navigation
- Visual focus indicators

### 10.3 Responsive Design
- Mobile-first design approach
- Flexible layouts
- Touch-friendly interfaces

## 11. Future Enhancements

### 11.1 Component Library
- Development of shared component library
- Design system implementation
- Component documentation

### 11.2 Advanced Features
- Real-time data updates
- Advanced visualizations
- Interactive elements

### 11.3 Performance Optimization
- Virtual scrolling for large lists
- Component-level code splitting
- Advanced caching strategies