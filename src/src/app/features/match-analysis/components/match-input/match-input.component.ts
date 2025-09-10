import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private snackBar: MatSnackBar
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

    // Mock analysis data for demo purposes
    setTimeout(() => {
      this.analysis = {
        playerName: formData.playerName,
        shard: formData.shard,
        stats: {
          kills: 1250,
          wins: 45,
          kdRatio: 2.34,
          damagePerMatch: 425
        },
        insights: [
          {
            type: 'Combat',
            description: 'Excellent accuracy with assault rifles (68% hit rate)'
          },
          {
            type: 'Strategy',
            description: 'Prefers aggressive early-game positioning'
          },
          {
            type: 'Improvement',
            description: 'Consider improving late-game decision making'
          }
        ]
      };
      
      this.loading = false;
      this.snackBar.open('Player analysis completed!', 'Close', { duration: 3000 });
    }, 2000);
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