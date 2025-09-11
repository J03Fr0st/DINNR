import { Component, OnInit, signal, computed, inject, effect } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { InsightsComponent } from "./components/insights/insights.component";
import { MaterialModule } from "../../material.module";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

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
      <app-insights></app-insights>
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

    .info-card {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
    }

    .info-content {
      display: flex;
      align-items: flex-start;
      gap: 20px;
    }

    .info-icon {
      font-size: 48px;
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

      .info-content {
        flex-direction: column;
        text-align: center;
      }
    }
  `,
  ],
  standalone: true,
  imports: [ReactiveFormsModule, MaterialModule, InsightsComponent],
})
export class MatchAnalysisComponent implements OnInit {
  // Inject dependencies using modern inject() function
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  // Signals for reactive state management
  matchForm = signal<FormGroup>(this.createForm());
  hasResults = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  // Computed signals
  isFormValid = computed(() => this.matchForm().valid);
  matchId = signal("");
  playerNames = signal("");

  // Form validation messages as signals
  validationMessages = computed(() => ({
    matchId: this.matchForm().get("matchId")?.hasError("required") ? "Match ID is required" : null,
    playerNames: this.matchForm().get("playerNames")?.hasError("required")
      ? "At least one player name is required"
      : null,
  }));

  constructor() {
    // Effect to watch for form changes
    effect(() => {
      const form = this.matchForm();
      if (form) {
        this.matchId.set(form.get("matchId")?.value || "");
        this.playerNames.set(form.get("playerNames")?.value || "");
      }
    });
  }

  ngOnInit(): void {
    // Modern reactive approach with takeUntilDestroyed
    this.route.queryParams.pipe(takeUntilDestroyed()).subscribe((params) => {
      const form = this.matchForm();
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
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      matchId: ["", [Validators.required]],
      playerNames: ["", [Validators.required]],
    });
  }

  clearForm(): void {
    this.matchForm().reset();
    this.hasResults.set(false);
    this.errorMessage.set(null);
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      // TODO: Implement actual match analysis logic
      console.log("Analyzing match:", {
        matchId: this.matchId(),
        playerNames: this.playerNames(),
      });
    }
  }
}
