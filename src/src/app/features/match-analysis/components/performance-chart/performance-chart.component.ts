import { Component, Input } from '@angular/core';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-performance-chart',
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
export class PerformanceChartComponent {
  @Input() playerStats: any[] = [];
  
  chartType: ChartConfiguration['type'] = 'radar';
  chartData: ChartConfiguration['data'] = {
    labels: ['Kills', 'Damage', 'Survival', 'Accuracy', 'Movement', 'Teamwork'],
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
        text: 'Player Performance Radar'
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100
      }
    }
  };

  ngOnChanges() {
    this.updateChartData();
  }

  private updateChartData() {
    if (!this.playerStats || this.playerStats.length === 0) return;

    const colors = [
      'rgba(255, 99, 132, 0.2)',
      'rgba(54, 162, 235, 0.2)',
      'rgba(255, 206, 86, 0.2)',
      'rgba(75, 192, 192, 0.2)'
    ];
    
    const borderColors = [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)'
    ];

    this.chartData.datasets = this.playerStats.map((player, index) => ({
      label: player.name,
      data: [
        this.normalizeValue(player.stats.kills, 10),
        this.normalizeValue(player.stats.damageDealt, 2000),
        this.normalizeValue(player.stats.survivalTime, 1800),
        this.normalizeValue(player.stats.combat.headshotPercentage * 100, 100),
        this.normalizeValue(player.stats.movement.totalDistance, 10000),
        this.normalizeValue(player.insights.performanceRating * 20, 100)
      ],
      backgroundColor: colors[index % colors.length],
      borderColor: borderColors[index % borderColors.length],
      borderWidth: 2
    }));
  }

  private normalizeValue(value: number, max: number): number {
    return Math.min((value / max) * 100, 100);
  }
}