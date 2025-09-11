import { Component, type OnInit, signal, computed, inject, effect } from "@angular/core";
import { FormBuilder, type FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatIconModule } from "@angular/material/icon";

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

      .info-content {
        flex-direction: column;
        text-align: center;
      }
    }
  `,
  ],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
  ],
})
export class PlayerStatsComponent implements OnInit {
  // Inject dependencies using modern inject() function
  private fb = inject(FormBuilder);

  // Signals for reactive state management
  playerForm = signal<FormGroup>(this.createForm());
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  playerData = signal<any>(null);

  // Form field signals
  playerName = signal("");

  // Computed signals
  isFormValid = computed(() => this.playerForm().valid);
  hasResults = computed(() => this.playerData() !== null);

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

  constructor() {
    // Effect to watch for form changes
    effect(() => {
      const form = this.playerForm();
      if (form) {
        this.playerName.set(form.get("playerName")?.value || "");
      }
    });
  }

  ngOnInit(): void {
    // Form is already created in the signal initialization
  }

  private createForm(): FormGroup {
    return this.fb.group({
      playerName: ["", [Validators.required, Validators.minLength(2)]],
    });
  }

  clearForm(): void {
    this.playerForm().reset();
    this.playerData.set(null);
    this.errorMessage.set(null);
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      // TODO: Implement actual player analysis logic
      console.log("Analyzing player:", this.playerName());

      // Simulate API call
      setTimeout(() => {
        this.isLoading.set(false);
        this.playerData.set({
          name: this.playerName(),
          matches: 150,
          wins: 25,
          avgDamage: 350,
        });
      }, 2000);
    }
  }
}
