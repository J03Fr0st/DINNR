import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-performance-chart',
  template: `
    <div class="chart-container">
      <div class="chart-placeholder">
        <h3>Performance Chart</h3>
        <p>Performance visualization will be implemented here</p>
        <div *ngIf="performanceData && performanceData.length > 0" class="data-preview">
          <div *ngFor="let item of performanceData" class="performance-item">
            {{ item.metric }}: {{ item.value }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      height: 300px;
      width: 100%;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    .chart-placeholder {
      text-align: center;
    }
    .data-preview {
      margin-top: 15px;
      text-align: left;
    }
    .performance-item {
      padding: 5px;
      border-bottom: 1px solid #eee;
    }
  `]
})
export class PerformanceChartComponent {
  @Input() performanceData: any[] = [];
}
