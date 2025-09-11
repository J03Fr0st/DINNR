import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-kill-timeline',
    template: `
    <div class="chart-container">
      <div class="chart-placeholder">
        <h3>Kill Timeline Chart</h3>
        <p>Chart visualization will be implemented here</p>
        <div *ngIf="timelineData && timelineData.length > 0" class="data-preview">
          <div *ngFor="let item of timelineData" class="timeline-item">
            {{ item.time }}: {{ item.event }}
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
    .timeline-item {
      padding: 5px;
      border-bottom: 1px solid #eee;
    }
  `],
    standalone: false
})
export class KillTimelineComponent {
  @Input() timelineData: any[] = [];
}
