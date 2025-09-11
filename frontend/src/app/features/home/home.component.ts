import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  template: `
    <div class="hero-section">
      <div class="hero-content">
        <h2>Analyze Your PUBG Performance</h2>
        <p>Transform raw telemetry data into actionable insights for faster improvement and smarter squad calls.</p>
        <div class="hero-actions">
          <button mat-raised-button color="primary" routerLink="/match-analysis">
            <mat-icon>analytics</mat-icon>
            Analyze Match
          </button>
          <button mat-raised-button color="accent" routerLink="/player-stats">
            <mat-icon>person_search</mat-icon>
            Player Stats
          </button>
        </div>
      </div>
    </div>

    <div class="features-section">
      <div class="features-grid">
      <mat-card class="feature-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>person_search</mat-icon>
            <mat-card-title>Player Statistics</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Comprehensive player performance tracking with historical data, trends, and improvement recommendations.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button routerLink="/player-stats">VIEW STATS</button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="feature-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>analytics</mat-icon>
            <mat-card-title>Match Analysis</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Deep dive into specific match performance with detailed telemetry analysis, weapon usage, and strategic insights.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button routerLink="/match-analysis">GET STARTED</button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
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
    }
  `],
  standalone: false
})
export class HomeComponent { }
