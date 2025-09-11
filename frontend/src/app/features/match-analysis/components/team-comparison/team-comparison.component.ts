import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-team-comparison",
  template: `
    <div class="chart-container">
      <div class="chart-placeholder">
        <h3>Team Comparison Chart</h3>
        <p>Team comparison visualization will be implemented here</p>
        <div *ngIf="comparisonData && comparisonData.length > 0" class="data-preview">
          <div *ngFor="let item of comparisonData" class="comparison-item">
            {{ item.team }}: {{ item.score }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
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
    .comparison-item {
      padding: 5px;
      border-bottom: 1px solid #eee;
    }
  `,
  ],
  standalone: true,
  imports: [CommonModule],
})
export class TeamComparisonComponent {
  @Input() comparisonData: any[] = [];
}
