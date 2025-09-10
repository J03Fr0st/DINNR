import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AnalysisService } from '../../../../core/services/index';
import { MatchAnalysis, Shard } from '../../../../core/models/index';

@Component({
  selector: 'app-match-input',
  templateUrl: './match-input.component.html',
  styleUrls: ['./match-input.component.scss']
})
export class MatchInputComponent implements OnInit {
  matchForm!: FormGroup;
  loading = false;
  analysis: MatchAnalysis | null = null;
  shards = ['pc-na', 'pc-eu', 'pc-as', 'pc-kakao', 'pc-sea', 'pc-krjp', 'pc-jp', 'pc-oc', 'pc-sa', 'pc-ru'];
  
  constructor(
    private fb: FormBuilder,
    private analysisService: AnalysisService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.matchForm = this.fb.group({
      matchId: ['', [Validators.required, Validators.pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)]],
      playerNames: ['', [Validators.required]],
      shard: ['pc-na', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.matchForm.invalid) {
      this.snackBar.open('Please fill in all required fields correctly', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;
    const formData = this.matchForm.value;
    const playerNames = formData.playerNames.split(',').map((name: string) => name.trim()).filter((name: string) => name);

    this.analysisService.submitMatchAnalysis({
      matchId: formData.matchId,
      playerNames,
      shard: formData.shard
    }).subscribe({
      next: (analysis) => {
        this.analysis = analysis;
        this.loading = false;
        this.snackBar.open('Match analysis completed!', 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open(`Error: ${error.message}`, 'Close', { duration: 5000 });
      }
    });
  }

  addPlayerName(): void {
    const currentNames = this.matchForm.get('playerNames')?.value || '';
    const names = currentNames.split(',').map((name: string) => name.trim()).filter((name: string) => name);
    names.push('');
    this.matchForm.patchValue({ playerNames: names.join(', ') });
  }

  exportAnalysis(): void {
    if (this.analysis) {
      const data = this.analysisService.exportMatchAnalysis(this.analysis);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `match-analysis-${this.analysis.matchId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  resetForm(): void {
    this.matchForm.reset();
    this.analysis = null;
  }
}