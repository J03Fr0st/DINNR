import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { PubgApiService } from '../../../../core/services';

interface PlayerAnalysis {
  playerName: string;
  shard: string;
  stats: {
    kills: number;
    wins: number;
    kdRatio: number;
    damagePerMatch: number;
  };
  insights: Array<{
    type: string;
    description: string;
  }>;
}

@Component({
  selector: 'app-match-input',
  templateUrl: './match-input.component.html',
  styleUrls: ['./match-input.component.scss']
})
export class MatchInputComponent implements OnInit {
  playerForm!: FormGroup;
  loading = false;
  analysis: PlayerAnalysis | null = null;
  shards = [
    { value: 'pc-na', label: 'North America' },
    { value: 'pc-eu', label: 'Europe' },
    { value: 'pc-as', label: 'Asia' },
    { value: 'pc-kakao', label: 'Kakao' },
    { value: 'pc-sea', label: 'South East Asia' },
    { value: 'pc-krjp', label: 'Korea/Japan' },
    { value: 'pc-jp', label: 'Japan' },
    { value: 'pc-oc', label: 'Oceania' },
    { value: 'pc-sa', label: 'South America' },
    { value: 'pc-ru', label: 'Russia' },
    { value: 'steam', label: 'Steam' }
  ];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private pubgApiService: PubgApiService
  ) {}

  ngOnInit(): void {
    this.playerForm = this.fb.group({
      playerName: ['', [Validators.required, Validators.minLength(2)]],
      shard: ['steam', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.playerForm.invalid) {
      this.snackBar.open('Please enter a valid player name and select a shard', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;
    const formData = this.playerForm.value;

    // Use real PUBG API
    this.pubgApiService.getPlayerByName(formData.playerName, formData.shard as any)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (player) => {
          // Get player stats and create analysis
          this.processPlayerData(player, formData.shard);
        },
        error: (error) => {
          console.error('API Error:', error);
          this.snackBar.open(`Failed to fetch player data: ${error.message}`, 'Close', { duration: 5000 });
        }
      });
  }

  private processPlayerData(player: any, shard: string): void {
    // Extract stats from player data
    const stats = this.extractPlayerStats(player);
    const insights = this.generateInsights(stats);

    this.analysis = {
      playerName: player.attributes.name,
      shard: shard,
      stats: stats,
      insights: insights
    };

    this.snackBar.open('Player analysis completed!', 'Close', { duration: 3000 });
  }

  private extractPlayerStats(player: any): any {
    const stats = player.attributes.stats || {};

    return {
      kills: stats.kills || 0,
      wins: stats.wins || 0,
      kdRatio: stats.kdRatio || 0,
      damagePerMatch: stats.damagePerMatch || 0
    };
  }

  private generateInsights(stats: any): any[] {
    const insights = [];

    if (stats.kills > 1000) {
      insights.push({
        type: 'Combat',
        description: 'Experienced player with high kill count'
      });
    }

    if (stats.kdRatio > 2.0) {
      insights.push({
        type: 'Performance',
        description: 'Excellent K/D ratio indicating strong combat skills'
      });
    }

    if (stats.wins > 50) {
      insights.push({
        type: 'Strategy',
        description: 'High number of wins shows good game sense'
      });
    }

    if (stats.damagePerMatch > 400) {
      insights.push({
        type: 'Combat',
        description: 'High average damage per match'
      });
    }

    // Add improvement suggestions
    if (stats.kdRatio < 1.0) {
      insights.push({
        type: 'Improvement',
        description: 'Focus on improving aim and positioning'
      });
    }

    if (stats.damagePerMatch < 200) {
      insights.push({
        type: 'Improvement',
        description: 'Increase engagement in firefights'
      });
    }

    return insights;
  }

  exportAnalysis(): void {
    if (!this.analysis) {
      this.snackBar.open('No analysis data to export', 'Close', { duration: 3000 });
      return;
    }

    try {
      const data = JSON.stringify(this.analysis, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `player-analysis-${this.analysis.playerName}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.snackBar.open('Analysis exported successfully!', 'Close', { duration: 3000 });
    } catch (error) {
      console.error('Export failed:', error);
      this.snackBar.open('Failed to export analysis', 'Close', { duration: 3000 });
    }
  }

  resetForm(): void {
    this.playerForm.reset();
    this.analysis = null;
  }
}
