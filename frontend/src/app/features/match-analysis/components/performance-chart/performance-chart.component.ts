import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

interface PerformanceData {
  metric: string;
  value: number;
  unit?: string;
  normalized: number;
}

@Component({
  selector: "app-performance-chart",
  template: `
    <ng-container *ngIf="hasData; else emptyState">
      <div class="chart-container">
        <h3>Team Performance Snapshot</h3>
        <div class="metrics">
          <div *ngFor="let metric of performanceData" class="metric">
            <div class="metric-header">
              <span class="metric-name">{{ metric.metric }}</span>
              <span class="metric-value">{{ metric.value | number:'1.0-0' }}{{ metric.unit ?? '' }}</span>
            </div>
            <div class="metric-bar">
              <div class="metric-fill" [style.width.%]="getWidth(metric.normalized)"></div>
            </div>
          </div>
        </div>
      </div>
    </ng-container>
    <ng-template #emptyState>
      <div class="empty-state">
        <h3>Team Performance Snapshot</h3>
        <p>No performance metrics calculated yet.</p>
      </div>
    </ng-template>
  `,
  styles: [
    `
    .chart-container {
      padding: 20px;
      border-radius: 12px;
      border: 1px solid rgba(102, 126, 234, 0.2);
      background: linear-gradient(145deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.08));
    }
    .chart-container h3 {
      margin-top: 0;
      margin-bottom: 16px;
      color: #333;
    }
    .metrics {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .metric {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .metric-header {
      display: flex;
      justify-content: space-between;
      font-weight: 600;
      color: #444;
    }
    .metric-bar {
      position: relative;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 999px;
      overflow: hidden;
      height: 12px;
    }
    .metric-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    }
    .empty-state {
      text-align: center;
      padding: 32px 16px;
      border: 1px dashed rgba(102, 126, 234, 0.3);
      border-radius: 12px;
      color: #666;
    }
  `,
  ],
  standalone: true,
  imports: [CommonModule],
})
export class PerformanceChartComponent {
  @Input() performanceData: PerformanceData[] = [];

  get hasData(): boolean {
    return this.performanceData.length > 0;
  }

  getWidth(normalized: number): number {
    const value = Math.max(Math.min(normalized, 1), 0);
    return Math.max(value * 100, 6);
  }
}
