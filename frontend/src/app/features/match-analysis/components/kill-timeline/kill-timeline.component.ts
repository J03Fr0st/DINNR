import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

interface TimelineData {
  matchNumber: number;
  matchId?: string;
  playerName?: string;
  kills: number;
  rank: string | number;
  mode: string;
  date: string;
  time: string;
}

@Component({
  selector: "app-kill-timeline",
  template: `
    <div class="timeline-container">
      <table class="timeline-table" *ngIf="timelineData && timelineData.length; else empty">
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Time</th>
            <th>Kills</th>
            <th>Rank</th>
            <th>Mode</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of timelineData">
            <td>{{ item.matchNumber }}</td>
            <td>{{ item.date }}</td>
            <td>{{ item.time }}</td>
            <td>{{ item.kills }}</td>
            <td>#{{ item.rank }}</td>
            <td>{{ item.mode }}</td>
          </tr>
        </tbody>
      </table>
      <ng-template #empty>
        <div class="empty-state">No match history available</div>
      </ng-template>
    </div>
  `,
  styles: [
    `
    .timeline-container { width: 100%; }
    .timeline-table { width: 100%; border-collapse: collapse; }
    .timeline-table th,
    .timeline-table td { padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .timeline-table th { text-align: left; font-weight: 600; color: #ddd; background: rgba(255,255,255,0.03); }
    .timeline-table tr:hover td { background: rgba(255,255,255,0.03); }
    .empty-state { text-align: center; padding: 16px; color: #aaa; }
  `,
  ],
  standalone: true,
  imports: [CommonModule],
})
export class KillTimelineComponent {
  @Input() timelineData: TimelineData[] = [];
}
