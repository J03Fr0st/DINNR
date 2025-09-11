import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize, switchMap, map } from 'rxjs/operators';
import { PubgApiService } from '../../../../core/services';
import { Player, Match, MatchResponse, Participant } from '../../../../core/models';

interface PlayerStats {
  kills: number;
  wins: number;
  kdRatio: number;
  damagePerMatch: number;
}

interface PlayerInsight {
  type: string;
  description: string;
}

interface PlayerAnalysis {
  playerName: string;
  region: string;
  stats: PlayerStats;
  insights: PlayerInsight[];
}

@Component({
    selector: 'app-match-input',
    templateUrl: './match-input.component.html',
    styleUrls: ['./match-input.component.scss'],
    standalone: false
})
export class MatchInputComponent implements OnInit {
  playerForm!: FormGroup;
  loading = false;
  analysis: PlayerAnalysis | null = null;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private pubgApiService: PubgApiService
  ) {}

  ngOnInit(): void {
    this.playerForm = this.fb.group({
      playerName: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  onSubmit(): void {
    if (this.playerForm.invalid) {
      this.snackBar.open('Please enter a valid player name', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;
    const formData = this.playerForm.value;

    console.log('Searching for player:', formData.playerName);

    // Use real PUBG API (shard is handled at client level)
    this.pubgApiService.getPlayerByName(formData.playerName)
      .pipe(
        switchMap(player => {
          console.log('Player response received:', player);
          // Fetch recent matches to calculate stats
          return this.pubgApiService.getPlayerMatches(player.id).pipe(
            map(matches => ({ player, matches }))
          );
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: ({ player, matches }: { player: Player; matches: any[] }) => {
          console.log('Player and matches received:', { player, matches });
          // Get player stats and create analysis
          this.processPlayerData(player, matches);
        },
        error: (error) => {
          console.error('API Error:', error);
          this.snackBar.open(`Failed to fetch player data: ${error.message}`, 'Close', { duration: 5000 });
        }
      });
  }

  private processPlayerData(player: Player, matches: any[]): void {
    console.log('Processing player data...');
    
    // Calculate stats from recent matches
    const stats = this.calculateStatsFromMatches(player, matches);
    const insights = this.generateInsights(stats);

    this.analysis = {
      playerName: player.attributes.name || 'Unknown',
      region: 'Steam', // Default since all queries use the steam shard
      stats: stats,
      insights: insights
    };

    console.log('Final analysis object:', this.analysis);
    this.snackBar.open('Player analysis completed!', 'Close', { duration: 3000 });
  }

  private calculateStatsFromMatches(player: Player, matches: any[]): PlayerStats {
    console.log('Calculating stats from matches:', matches);
    
    if (!matches || matches.length === 0) {
      return {
        kills: 0,
        wins: 0,
        kdRatio: 0,
        damagePerMatch: 0
      };
    }

    let totalKills = 0;
    let totalDeaths = 0;
    let totalWins = 0;
    let totalDamage = 0;
    let validMatches = 0;

    const playerId = player.id;
    
    matches.forEach(matchResponse => {
      try {
        // Find the participant data for this player in the included data
        const participantData = matchResponse.included?.find((inc: any) => 
          inc.type === 'participant' && 
          inc.attributes?.stats?.playerId === playerId
        );

        if (participantData?.attributes?.stats) {
          const stats = participantData.attributes.stats;
          totalKills += stats.kills || 0;
          totalDeaths += stats.deathType !== 'alive' ? 1 : 0;
          totalWins += stats.winPlace === 1 ? 1 : 0;
          totalDamage += stats.damageDealt || 0;
          validMatches++;
        }
      } catch (error) {
        console.warn('Error processing match:', error);
      }
    });

    const kdRatio = totalDeaths > 0 ? totalKills / totalDeaths : totalKills;
    const damagePerMatch = validMatches > 0 ? totalDamage / validMatches : 0;

    console.log('Calculated stats:', {
      kills: totalKills,
      wins: totalWins,
      kdRatio,
      damagePerMatch,
      matchesProcessed: validMatches
    });

    return {
      kills: totalKills,
      wins: totalWins,
      kdRatio: Number(kdRatio.toFixed(2)),
      damagePerMatch: Number(damagePerMatch.toFixed(0))
    };
  }

  private generateInsights(stats: PlayerStats): PlayerInsight[] {
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
    this.playerForm.reset({
      playerName: ''
    });
    this.analysis = null;
  }
}
