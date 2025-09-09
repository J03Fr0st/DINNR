import { Component, Input } from '@angular/core';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-team-comparison',
  template: `
    <div class="chart-container">
      <canvas baseChart [type]="chartType" [data]="chartData" [options]="chartOptions"></canvas>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      height: 400px;
      width: 100%;
    }
  `]
})
export class TeamComparisonComponent {
  @Input() players: any[] = [];
  
  chartType: ChartConfiguration['type'] = 'bar';
  chartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: []
  };
  
  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Team Performance Comparison'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Value'
        }
      }
    }
  };

  ngOnChanges() {
    this.updateChartData();
  }

  private updateChartData() {
    if (!this.players || this.players.length === 0) return;

    this.chartData.labels = this.players.map(player => player.name);
    
    this.chartData.datasets = [
      {
        label: 'Kills',
        data: this.players.map(player => player.stats.kills),
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      },
      {
        label: 'Damage',
        data: this.players.map(player => Math.round(player.stats.damageDealt)),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'Survival Time (min)',
        data: this.players.map(player => Math.round(player.stats.survivalTime / 60)),
        backgroundColor: 'rgba(255, 206, 86, 0.8)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1
      },
      {
        label: 'Placement',
        data: this.players.map(player => player.stats.placement),
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ];
  }
}