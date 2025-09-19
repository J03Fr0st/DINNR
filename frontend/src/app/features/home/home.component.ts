import { Component, signal, computed } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
  buttonText: string;
  route: string;
}

interface HeroAction {
  icon: string;
  text: string;
  route: string;
  color: "primary" | "accent";
}

@Component({
  selector: "app-home",
  template: `
    <div class="hero-section">
      <div class="hero-content">
        <h2>{{ heroTitle() }}</h2>
        <p>{{ heroDescription() }}</p>
        <div class="hero-actions">
          @for (action of heroActions(); track action.route) {
            <button 
              mat-raised-button 
              [color]="action.color" 
              [routerLink]="action.route"
              (click)="onHeroActionClick(action.route)">
              <mat-icon>{{ action.icon }}</mat-icon>
              {{ action.text }}
            </button>
          }
        </div>
      </div>
    </div>

    <div class="features-section">
      <div class="features-grid">
        @for (feature of features(); track feature.title) {
          <mat-card class="feature-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>{{ feature.icon }}</mat-icon>
              <mat-card-title>{{ feature.title }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>{{ feature.description }}</p>
            </mat-card-content>
            <mat-card-actions>
              <button 
                mat-button 
                [routerLink]="feature.route"
                (click)="onFeatureClick(feature.route)">
                {{ feature.buttonText }}
              </button>
            </mat-card-actions>
          </mat-card>
        }
      </div>
      
      @if (showStats()) {
        <div class="stats-section">
          <h3>Platform Statistics</h3>
          <div class="stats-grid">
            @for (stat of stats(); track stat.label) {
              <div class="stat-item">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
    .hero-section {
      text-align: center;
      padding: 80px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      margin-bottom: 60px;
    }

    .hero-content h2 {
      font-size: 3em;
      margin-bottom: 20px;
      font-weight: 300;
    }

    .hero-content p {
      font-size: 1.3em;
      margin-bottom: 40px;
      opacity: 0.9;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .hero-actions {
      display: flex;
      gap: 20px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .hero-actions button {
      font-size: 1.1em;
      padding: 15px 30px;
    }

    .features-section {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 40px;
      margin-bottom: 60px;
    }

    .feature-card {
      height: 100%;
    }

    .feature-card mat-card-content {
      padding-bottom: 20px;
    }

    .feature-card mat-icon[mat-card-avatar] {
      font-size: 40px;
      width: 60px;
      height: 60px;
      line-height: 60px;
    }

    .stats-section {
      margin-top: 40px;
      text-align: center;
    }

    .stats-section h3 {
      font-size: 2em;
      margin-bottom: 30px;
      color: #333;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .stat-item {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
      border-radius: 8px;
      padding: 20px;
      border: 1px solid rgba(102, 126, 234, 0.2);
    }

    .stat-value {
      font-size: 2.5em;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 5px;
    }

    .stat-label {
      color: #666;
      font-size: 0.9em;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    @media (max-width: 768px) {
      .hero-content h2 {
        font-size: 2.5em;
      }

      .hero-actions {
        flex-direction: column;
        align-items: center;
      }

      .features-grid {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `,
  ],
  standalone: true,
  imports: [RouterModule, MatCardModule, MatButtonModule, MatIconModule],
})
export class HomeComponent {
  // Services can be injected when needed

  // Signals for reactive state management
  heroTitle = signal("Analyze Your PUBG Performance");
  heroDescription = signal(
    "Transform raw telemetry data into actionable insights for faster improvement and smarter squad calls.",
  );
  showStats = signal(true);

  // Hero actions as signal
  heroActions = signal<HeroAction[]>([
    {
      icon: "analytics",
      text: "Analyze Match",
      route: "/match-analysis",
      color: "primary",
    },
    {
      icon: "person_search",
      text: "Player Stats",
      route: "/player-stats",
      color: "accent",
    },
  ]);

  // Features as signal
  features = signal<FeatureCard[]>([
    {
      icon: "person_search",
      title: "Player Statistics",
      description:
        "Comprehensive player performance tracking with historical data, trends, and improvement recommendations.",
      buttonText: "VIEW STATS",
      route: "/player-stats",
    },
    {
      icon: "analytics",
      title: "Match Analysis",
      description:
        "Deep dive into specific match performance with detailed telemetry analysis, weapon usage, and strategic insights.",
      buttonText: "GET STARTED",
      route: "/match-analysis",
    },
  ]);

  // Platform statistics as signal
  stats = signal([
    { label: "Matches Analyzed", value: "10K+" },
    { label: "Players Tracked", value: "2.5K+" },
    { label: "Insights Generated", value: "50K+" },
    { label: "Success Rate", value: "98%" },
  ]);

  // Computed signals for enhanced functionality
  featuresCount = computed(() => this.features().length);
  hasHeroActions = computed(() => this.heroActions().length > 0);

  // Event handlers
  onHeroActionClick(route: string): void {
    console.log(`Navigating to: ${route}`);
  }

  onFeatureClick(route: string): void {
    console.log(`Feature clicked: ${route}`);
  }
}
