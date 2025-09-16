import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { CommonModule } from "@angular/common";

interface ComparisonDatum {
  player: string;
  kills: number;
  damage: number;
  survivalTime: number;
  kdRatio: number;
}

@Component({
  selector: "app-team-comparison",
  template: `
    <ng-container *ngIf="comparisonData.length; else empty">
      <div class="comparison-container">
        <h3>Player Comparison</h3>
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Kills</th>
              <th>Damage</th>
              <th>Survival (s)</th>
              <th>K/D</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of comparisonData">
              <td class="player-name">{{ row.player }}</td>
              <td>
                <div class="bar">
                  <div class="fill" [style.width.%]="getRatio(row.kills, 'kills')"></div>
                </div>
                <span>{{ row.kills }}</span>
              </td>
              <td>
                <div class="bar">
                  <div class="fill" [style.width.%]="getRatio(row.damage, 'damage')"></div>
                </div>
                <span>{{ row.damage }}</span>
              </td>
              <td>
                <div class="bar">
                  <div class="fill" [style.width.%]="getRatio(row.survivalTime, 'survival')"></div>
                </div>
                <span>{{ row.survivalTime }}</span>
              </td>
              <td>{{ row.kdRatio }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </ng-container>
    <ng-template #empty>
      <div class="empty-state">
        <h3>Player Comparison</h3>
        <p>No comparison data available.</p>
      </div>
    </ng-template>
  `,
  styles: [
    `
    .comparison-container {
      padding: 20px;
      border: 1px solid rgba(118, 75, 162, 0.15);
      border-radius: 12px;
      background: rgba(118, 75, 162, 0.06);
    }
    h3 {
      margin: 0 0 16px 0;
      color: #333;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th,
    td {
      padding: 10px 12px;
      text-align: left;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      font-size: 0.95rem;
    }
    th {
      color: #555;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.4);
    }
    .player-name {
      font-weight: 600;
      color: #333;
    }
    .bar {
      background: rgba(255, 255, 255, 0.5);
      border-radius: 999px;
      height: 10px;
      overflow: hidden;
      margin-bottom: 6px;
    }
    .fill {
      height: 100%;
      background: linear-gradient(90deg, #43cea2 0%, #185a9d 100%);
    }
    td span {
      color: #555;
      font-size: 0.85rem;
    }
    .empty-state {
      text-align: center;
      padding: 30px 16px;
      border: 1px dashed rgba(118, 75, 162, 0.3);
      border-radius: 12px;
      color: #666;
    }
  `,
  ],
  standalone: true,
  imports: [CommonModule],
})
export class TeamComparisonComponent implements OnChanges {
  @Input() comparisonData: ComparisonDatum[] = [];

  private maxValues = {
    kills: 1,
    damage: 1,
    survival: 1,
  };

  ngOnChanges(_changes: SimpleChanges): void {
    this.maxValues = {
      kills: this.getMax("kills"),
      damage: this.getMax("damage"),
      survival: this.getMax("survivalTime"),
    };
  }

  getRatio(value: number, key: "kills" | "damage" | "survival"): number {
    const max = this.maxValues[key] || 1;
    return Math.max(Math.min((value / max) * 100, 100), 8);
  }

  private getMax(prop: "kills" | "damage" | "survivalTime"): number {
    return this.comparisonData.reduce((max, item) => Math.max(max, item[prop]), 1);
  }
}
