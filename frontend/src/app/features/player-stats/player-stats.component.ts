import { CommonModule } from "@angular/common";
import { Component, type OnInit, signal, computed, inject, DestroyRef } from "@angular/core";
import { FormBuilder, type FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatIconModule } from "@angular/material/icon";
import type { PlayerStats } from "../../core/services/analysis.service";
import { AnalysisService } from "../../core/services/analysis.service";

@Component({
  selector: "app-player-stats",
  template: `
    <div class="player-stats-container">
      <div class="page-header">
        <h1>
          <mat-icon>person_search</mat-icon>
          Player Statistics
        </h1>
        <p class="page-description">
          Analyze player performance across multiple matches and track improvement over time
        </p>
      </div>

      <mat-card class="stats-form-card">
        <mat-card-header>
          <mat-card-title>Player Analysis</mat-card-title>
          <mat-card-subtitle>Enter a player name to get comprehensive performance insights</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="playerForm()" class="player-form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Player Name</mat-label>
              <input matInput formControlName="playerName" placeholder="Enter PUBG player name">
              <mat-icon matSuffix>person</mat-icon>
              @if (validationMessages().required) {
                <mat-error>{{ validationMessages().required }}</mat-error>
              }
              @if (validationMessages().minlength) {
                <mat-error>{{ validationMessages().minlength }}</mat-error>
              }
              <mat-hint>Enter the exact in-game player name</mat-hint>
            </mat-form-field>

            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="!isFormValid() || isLoading()">
                @if (isLoading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  <mat-icon>analytics</mat-icon>
                }
                {{ isLoading() ? 'Analyzing...' : 'Analyze Player' }}
              </button>
              <button mat-raised-button type="button" (click)="clearForm()">
                <mat-icon>refresh</mat-icon>
                Clear
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      @if (errorMessage()) {
        <mat-card class="error-card">
          <mat-card-content>
            <mat-icon color="warn">error_outline</mat-icon>
            <span>{{ errorMessage() }}</span>
          </mat-card-content>
        </mat-card>
      }

      @if (playerStats(); as stats) {
        <mat-card class="results-card">
          <mat-card-header>
            <mat-card-title>{{ stats.playerName }}</mat-card-title>
            <mat-card-subtitle>Overall performance overview</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="overall-stats-grid">
              <div class="stat-item">
                <span class="stat-label">Matches</span>
                <span class="stat-value">{{ stats.overallStats.matchesPlayed }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Wins</span>
                <span class="stat-value">{{ stats.overallStats.wins }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Kills</span>
                <span class="stat-value">{{ stats.overallStats.kills }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Deaths</span>
                <span class="stat-value">{{ stats.overallStats.deaths }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">K/D Ratio</span>
                <span class="stat-value">{{ stats.overallStats.kdRatio | number:'1.2-2' }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Win Rate</span>
                <span class="stat-value">{{ stats.overallStats.winRate | number:'1.1-1' }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Avg Damage</span>
                <span class="stat-value">{{ stats.overallStats.avgDamage | number:'1.0-0' }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Avg Survival</span>
                <span class="stat-value">{{ formatTime(stats.overallStats.avgSurvivalTime) }}</span>
              </div>
            </div>

            <div class="recent-matches">
              <h3>Recent Matches</h3>
              @if (stats.recentMatches.length) {
                <table class="recent-matches-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Map</th>
                      <th>Mode</th>
                      <th>Kills</th>
                      <th>Placement</th>
                      <th>Damage</th>
                      <th>Survival</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (match of stats.recentMatches; track match.matchId) {
                      <tr>
                        <td>{{ formatDate(match.date) }}</td>
                        <td>{{ match.mapName }}</td>
                        <td>{{ match.gameMode }}</td>
                        <td>{{ match.kills }}</td>
                        <td>#{{ match.placement }}</td>
                        <td>{{ match.damageDealt | number:'1.0-0' }}</td>
                        <td>{{ formatTime(match.survivalTime) }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              } @else {
                <p class="empty-state">No recent matches available for this player.</p>
              }
            </div>
          </mat-card-content>
        </mat-card>
      }

      <mat-card class="info-card">
        <mat-card-content>
          <div class="info-content">
            <mat-icon class="info-icon">info</mat-icon>
            <div>
              <h3>Player Statistics Features</h3>
              <ul>
                @for (feature of features(); track feature) {
                  <li>{{ feature }}</li>
                }
              </ul>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
    .player-stats-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .page-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .page-header h1 {
      font-size: 2.5em;
      color: #333;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15px;
    }

    .page-header mat-icon {
      color: #667eea;
      font-size: 1.2em;
    }

    .page-description {
      font-size: 1.2em;
      color: #666;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.5;
    }

    .stats-form-card {
      margin-bottom: 30px;
    }

    .player-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: flex-start;
      flex-wrap: wrap;
    }

    .form-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .error-card {
      margin-bottom: 24px;
      border-left: 4px solid #f44336;
    }

    .error-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #f44336;
      font-weight: 500;
    }

    .results-card {
      margin-bottom: 30px;
    }

    .overall-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-item {
      background: #fafafa;
      border-radius: 8px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      border: 1px solid rgba(0, 0, 0, 0.04);
    }

    .stat-label {
      font-size: 0.85rem;
      text-transform: uppercase;
      color: #666;
      letter-spacing: 0.08em;
    }

    .stat-value {
      font-size: 1.4rem;
      font-weight: 600;
      color: #333;
    }

    .recent-matches h3 {
      margin: 0 0 12px 0;
      color: #333;
    }

    .recent-matches-table {
      width: 100%;
      border-collapse: collapse;
    }

    .recent-matches-table th,
    .recent-matches-table td {
      padding: 12px 10px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      text-align: left;
      font-size: 0.95rem;
    }

    .recent-matches-table th {
      font-weight: 600;
      color: #555;
      background: rgba(102, 126, 234, 0.06);
    }

    .recent-matches-table tr:hover td {
      background: rgba(102, 126, 234, 0.05);
    }

    .empty-state {
      margin: 0;
      color: #777;
      font-style: italic;
    }

    .info-card {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
    }

    .info-content {
      display: flex;
      align-items: flex-start;
      gap: 20px;
    }

    .info-icon {
      font-size: 48px !important;
      color: #667eea;
      flex-shrink: 0;
    }

    .info-content h3 {
      margin: 0 0 15px 0;
      color: #333;
    }

    .info-content ul {
      margin: 0;
      padding-left: 20px;
      color: #666;
    }

    .info-content li {
      margin-bottom: 8px;
    }

    @media (max-width: 768px) {
      .page-header h1 {
        font-size: 2em;
        flex-direction: column;
        gap: 10px;
      }

      .page-description {
        font-size: 1.1em;
      }

      .form-actions {
        justify-content: center;
      }

      .overall-stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      }

      .info-content {
        flex-direction: column;
        text-align: center;
      }
    }
  `,
  ],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
})
export class PlayerStatsComponent implements OnInit {
  // Inject dependencies using modern inject() function
  private fb = inject(FormBuilder);
  private analysisService = inject(AnalysisService);
  private destroyRef = inject(DestroyRef);

  // Signals for reactive state management
  playerForm = signal<FormGroup>(this.createForm());
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  playerStats = signal<PlayerStats | null>(null);
  isFormValid = signal(false);

  // Computed signals
  // Features list as signal
  features = signal([
    "Historical performance tracking",
    "Match-by-match analysis",
    "Performance trends and insights",
    "Weapon usage statistics",
    "Improvement recommendations",
  ]);

  // Form validation messages
  validationMessages = computed(() => ({
    required: this.playerForm().get("playerName")?.hasError("required") ? "Player name is required" : null,
    minlength: this.playerForm().get("playerName")?.hasError("minlength")
      ? "Player name must be at least 2 characters"
      : null,
  }));

  ngOnInit(): void {
    // Set up form change detection to update isFormValid signal
    this.playerForm().valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.isFormValid.set(this.playerForm().valid);
      });

    // Also listen to status changes (for validation state changes)
    this.playerForm().statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.isFormValid.set(this.playerForm().valid);
      });

    // Set initial validation state
    this.isFormValid.set(this.playerForm().valid);
  }

  private createForm(): FormGroup {
    return this.fb.group({
      playerName: ["", [Validators.required, Validators.minLength(2)]],
    });
  }

  clearForm(): void {
    this.playerForm().reset();
    this.playerStats.set(null);
    this.errorMessage.set(null);
    this.isLoading.set(false);
    this.isFormValid.set(this.playerForm().valid);
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      return;
    }

    const playerNameControl = this.playerForm().get("playerName");
    const playerName = (playerNameControl?.value as string | undefined)?.trim() ?? "";

    if (!playerName) {
      this.errorMessage.set("Player name is required");
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.analysisService
      .getPlayerStats(playerName)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (stats) => {
          this.playerStats.set(stats);
          this.isLoading.set(false);
        },
        error: (error: unknown) => {
          const message = error instanceof Error ? error.message : "Failed to load player statistics";
          this.errorMessage.set(message);
          this.isLoading.set(false);
        },
      });
  }

  formatDate(value: string): string {
    const timestamp = Date.parse(value);
    if (Number.isNaN(timestamp)) {
      return value;
    }
    return new Date(timestamp).toLocaleString();
  }

  formatTime(seconds: number): string {
    const total = Math.max(Math.floor(seconds), 0);
    const minutes = Math.floor(total / 60);
    const remaining = total % 60;
    return `${minutes}:${remaining.toString().padStart(2, "0")}`;
  }
}
