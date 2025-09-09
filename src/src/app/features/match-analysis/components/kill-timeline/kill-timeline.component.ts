import { Component, Input } from '@angular/core';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-kill-timeline',
  template: `
    <div class="chart-container">
      <canvas baseChart [type]="chartType" [data]="chartData" [options]="chartOptions"></canvas>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      height: 300px;
      width: 100%;
    }
  `]
})
export class KillTimelineComponent {
  @Input() timelineData: any[] = [];
  
  chartType: ChartConfiguration['type'] = 'line';
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
        text: 'Kill Timeline'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Kills'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time (minutes)'
        }
      }
    }
  };

  ngOnChanges() {
    this.updateChartData();
  }

  private updateChartData() {
    if (!this.timelineData || this.timelineData.length === 0) return;

    const timeLabels = this.timelineData.map(point => Math.floor(point.time / 60));
    const killCounts = this.timelineData.map(point => point.kills || 0);

    this.chartData = {
      labels: timeLabels,
      datasets: [{
        label: 'Kills Over Time',
        data: killCounts,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    };
  }
}