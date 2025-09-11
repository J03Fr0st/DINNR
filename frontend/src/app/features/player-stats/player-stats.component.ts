import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

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
          <form [formGroup]="playerForm" class="player-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Player Name</mat-label>
              <input matInput formControlName="playerName" placeholder="Enter PUBG player name">
              <mat-icon matSuffix>person</mat-icon>
              <mat-error *ngIf="playerForm.get('playerName')?.hasError('required')">
                Player name is required
              </mat-error>
              <mat-error *ngIf="playerForm.get('playerName')?.hasError('minlength')">
                Player name must be at least 2 characters
              </mat-error>
              <mat-hint>Enter the exact in-game player name</mat-hint>
            </mat-form-field>

            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="playerForm.invalid">
                <mat-icon>analytics</mat-icon>
                Analyze Player
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
                <li>Historical performance tracking</li>
                <li>Match-by-match analysis</li>
                <li>Performance trends and insights</li>
                <li>Weapon usage statistics</li>
                <li>Improvement recommendations</li>
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
  standalone: false,
})
export class PlayerStatsComponent implements OnInit {
  playerForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.playerForm = this.fb.group({
      playerName: ["", [Validators.required, Validators.minLength(2)]],
    });
  }

  clearForm(): void {
    this.playerForm.reset();
  }
}
