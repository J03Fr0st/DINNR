import { Component, OnInit, signal, computed, inject } from "@angular/core";
import { DecimalPipe } from "@angular/common";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import type { MatchAnalysis } from "../../core/models";
import { AnalysisService } from "../../core/services/analysis.service";
import {
  VisualizationService,
  type KillTimelineItem,
  type PerformanceMetric,
  type PlayerComparisonItem,
  type HeatmapCell,
  type WeaponUsageItem,
} from "../../core/services/visualization.service";
import { MaterialModule } from "../../material.module";
import { InsightsComponent } from "./components/insights/insights.component";
import { KillTimelineComponent } from "./components/kill-timeline/kill-timeline.component";
import { MatchSummaryComponent } from "./components/match-summary/match-summary.component";
import { PerformanceChartComponent } from "./components/performance-chart/performance-chart.component";
import { PlayerStatsComponent as MatchAnalysisPlayerStatsComponent } from "./components/player-stats/player-stats.component";
import { TeamComparisonComponent } from "./components/team-comparison/team-comparison.component";

@Component({
  selector: "app-match-analysis",
  template: `
    <div class="match-analysis-container">
      <div class="page-header">
        <h1>
          <i class="fas fa-analytics"></i>
          Match Analysis
        </h1>
        <p class="page-description">
          Deep dive into match telemetry and player performance with detailed insights
        </p>
      </div>

      <mat-card class="analysis-form-card">
        <mat-card-header>
          <mat-card-title>Match & Player Input</mat-card-title>
          <mat-card-subtitle>Enter match ID and player names for detailed analysis</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="matchForm()" class="match-form" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Match ID</mat-label>
                <input matInput formControlName="matchId" placeholder="Enter match ID (GUID)">
                <i class="fas fa-hashtag mat-suffix" matSuffix></i>
                @if (validationMessages().matchId) {
                  <mat-error>{{ validationMessages().matchId }}</mat-error>
                }
                <mat-hint>Enter the GUID of the match to analyze</mat-hint>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Player Names</mat-label>
                <input matInput formControlName="playerNames" placeholder="Enter player names, separated by commas">
                <i class="fas fa-users mat-suffix" matSuffix></i>
                @if (validationMessages().playerNames) {
                  <mat-error>{{ validationMessages().playerNames }}</mat-error>
                }
                <mat-hint>Enter one or more player names to analyze from this match</mat-hint>
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="!isFormValid() || isLoading()">
                @if (isLoading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  <i class="fas fa-chart-line"></i>
                }
                {{ isLoading() ? 'Analyzing...' : 'Analyze Match' }}
              </button>
              <button mat-raised-button type="button" (click)="clearForm()">
                <i class="fas fa-redo"></i>
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

      @if (analysisResult(); as analysis) {
        <div class="analysis-results">
          <app-match-summary class="result-card" [summary]="analysis.matchSummary"></app-match-summary>
          <app-player-stats class="result-card" [players]="analysis.players"></app-player-stats>
          <app-insights class="result-card" [insights]="analysis.insights"></app-insights>
        </div>

        <div class="analysis-visualizations">
          <app-performance-chart class="result-card" [performanceData]="performanceMetrics()"></app-performance-chart>
          <app-team-comparison class="result-card" [comparisonData]="playerComparison()"></app-team-comparison>
          <app-kill-timeline class="result-card" [timelineData]="killTimeline()"></app-kill-timeline>

          @if (heatmapCells().length) {
            <mat-card class="result-card heatmap-card">
              <mat-card-header>
                <mat-card-title>Movement Heatmap</mat-card-title>
                <mat-card-subtitle>Top engagement zones across tracked players</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="heatmap-grid">
                  @for (cell of heatmapCells(); track cell.id) {
                    <div class="heatmap-cell" [style.background-color]="getHeatmapColor(cell.intensity)">
                      <span class="heatmap-coordinates">({{ cell.x }}, {{ cell.y }})</span>
                      <span class="heatmap-count">{{ cell.count }} events</span>
                    </div>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          }

          @if (weaponUsage().length) {
            <mat-card class="result-card weapon-card">
              <mat-card-header>
                <mat-card-title>Weapon Highlights</mat-card-title>
                <mat-card-subtitle>Most effective weapons across analyzed players</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="weapon-list">
                  @for (weapon of weaponUsage(); track weapon.weapon) {
                    <div class="weapon-item">
                      <div class="weapon-name">{{ weapon.weapon }}</div>
                      <div class="weapon-stats">
                        <span>{{ weapon.kills }} kills</span>
                        <span>{{ weapon.damage }} dmg</span>
                        <span>{{ (weapon.accuracy * 100) | number:'1.0-0' }}% acc</span>
                      </div>
                    </div>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
    .match-analysis-container {
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

    .page-header i {
      color: #667eea;
    }

    .page-description {
      font-size: 1.2em;
      color: #666;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.5;
    }

    .analysis-form-card {
      margin-bottom: 30px;
    }

    .match-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-row {
      width: 100%;
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

    .analysis-results {
      display: grid;
      gap: 24px;
      margin-top: 24px;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    }

    .result-card {
      width: 100%;
    }

    .analysis-visualizations {
      display: grid;
      gap: 24px;
      margin-top: 24px;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    }

    .heatmap-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
    }

    .heatmap-cell {
      border-radius: 8px;
      padding: 12px;
      color: #fff;
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-weight: 500;
    }

    .heatmap-coordinates {
      font-size: 0.9rem;
    }

    .heatmap-count {
      font-size: 1.1rem;
    }

    .weapon-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .weapon-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 8px;
      padding: 12px 16px;
      background: #fafafa;
    }

    .weapon-name {
      font-weight: 600;
      color: #333;
    }

    .weapon-stats {
      display: flex;
      gap: 16px;
      color: #555;
      font-size: 0.95rem;
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

      .analysis-visualizations {
        grid-template-columns: 1fr;
      }

      .heatmap-grid {
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      }
    }
  `,
  ],
  standalone: true,
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    MaterialModule,
    InsightsComponent,
    MatchSummaryComponent,
    MatchAnalysisPlayerStatsComponent,
    PerformanceChartComponent,
    TeamComparisonComponent,
    KillTimelineComponent,
  ],
})
export class MatchAnalysisComponent implements OnInit {
  // Inject dependencies using modern inject() function
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private analysisService = inject(AnalysisService);
  private visualizationService = inject(VisualizationService);

  // Signals for reactive state management
  matchForm = signal<FormGroup>(this.createForm());
  analysisResult = signal<MatchAnalysis | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  isFormValid = signal(this.matchForm().valid);

  // Form validation messages as signals
  validationMessages = computed(() => ({
    matchId: this.matchForm().get("matchId")?.hasError("required") ? "Match ID is required" : null,
    playerNames: this.matchForm().get("playerNames")?.hasError("required")
      ? "At least one player name is required"
      : null,
  }));

  performanceMetrics = computed<PerformanceMetric[]>(() => {
    const analysis = this.analysisResult();
    return analysis ? this.visualizationService.buildPerformanceMetrics(analysis) : [];
  });

  killTimeline = computed<KillTimelineItem[]>(() => {
    const analysis = this.analysisResult();
    return analysis ? this.visualizationService.buildKillTimeline(analysis) : [];
  });

  playerComparison = computed<PlayerComparisonItem[]>(() => {
    const analysis = this.analysisResult();
    return analysis ? this.visualizationService.buildPlayerComparison(analysis) : [];
  });

  heatmapCells = computed<HeatmapCell[]>(() => {
    const analysis = this.analysisResult();
    return analysis ? this.visualizationService.generateHeatmapData(analysis.players) : [];
  });

  weaponUsage = computed<WeaponUsageItem[]>(() => {
    const analysis = this.analysisResult();
    return analysis ? this.visualizationService.buildWeaponUsage(analysis.players) : [];
  });

  ngOnInit(): void {
    const form = this.matchForm();

    // Keep the form validity signal in sync with reactive form changes
    this.isFormValid.set(form.valid);
    form.statusChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.isFormValid.set(form.valid);
    });
    form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.isFormValid.set(form.valid);
    });

    // Modern reactive approach with takeUntilDestroyed
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe((params) => {
      if (params["matchId"]) {
        form.patchValue({
          matchId: params["matchId"],
        });
      }
      if (params["players"]) {
        const players = Array.isArray(params["players"]) ? params["players"].join(", ") : params["players"];
        form.patchValue({
          playerNames: players,
        });
      }
      this.isFormValid.set(form.valid);
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      matchId: ["", [Validators.required]],
      playerNames: ["", [Validators.required]],
    });
  }

  clearForm(): void {
    this.matchForm().reset({
      matchId: "",
      playerNames: "",
    });
    this.analysisResult.set(null);
    this.errorMessage.set(null);
    this.isLoading.set(false);
    this.isFormValid.set(this.matchForm().valid);
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      return;
    }

    const formValue = this.matchForm().value;
    const matchId = (formValue["matchId"] ?? "").trim();
    const players = this.parsePlayerNames(formValue["playerNames"] ?? "");

    if (!matchId || players.length === 0) {
      this.errorMessage.set("Provide a match ID and at least one player name");
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.analysisService
      .analyzeMatch(matchId, players)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (analysis) => {
          this.analysisResult.set(analysis);
          this.isLoading.set(false);
        },
        error: (error: unknown) => {
          const message = error instanceof Error ? error.message : "Failed to analyze match";
          this.errorMessage.set(message);
          this.isLoading.set(false);
        },
      });
  }

  getHeatmapColor(intensity: number): string {
    const normalized = Math.min(Math.max(intensity, 0), 1);
    const alpha = 0.25 + normalized * 0.75;
    return "rgba(102, 126, 234, " + alpha.toFixed(2) + ")";
  }

  private parsePlayerNames(value: string): string[] {
    return value
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);
  }
}
