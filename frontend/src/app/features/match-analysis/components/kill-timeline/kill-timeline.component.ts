import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

interface TimelineItem {
  time: string;
  description: string;
  players: string[];
  impact: number;
}

@Component({
  selector: "app-kill-timeline",
  template: `
    <ng-container *ngIf="timelineData.length; else empty">
      <div class="timeline-container">
        <h3>Key Match Moments</h3>
        <ul class="timeline">
          <li *ngFor="let item of timelineData">
            <div class="timestamp">{{ item.time }}</div>
            <div class="details">
              <div class="description">{{ item.description }}</div>
              <div class="players">{{ item.players.join(', ') }}</div>
            </div>
            <div class="impact">Impact {{ item.impact }}/5</div>
          </li>
        </ul>
      </div>
    </ng-container>
    <ng-template #empty>
      <div class="empty-state">
        <h3>Key Match Moments</h3>
        <p>No timeline events available.</p>
      </div>
    </ng-template>
  `,
  styles: [
    `
    .timeline-container {
      padding: 20px;
      border-radius: 12px;
      border: 1px solid rgba(102, 126, 234, 0.18);
      background: rgba(102, 126, 234, 0.08);
    }
    h3 {
      margin: 0 0 16px;
      color: #333;
    }
    .timeline {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .timeline li {
      display: grid;
      grid-template-columns: 100px 1fr auto;
      align-items: center;
      gap: 16px;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 8px;
    }
    .timestamp {
      font-weight: 600;
      color: #4a5568;
    }
    .details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .description {
      font-weight: 600;
      color: #2d3748;
    }
    .players {
      color: #555;
      font-size: 0.9rem;
    }
    .impact {
      font-weight: 600;
      color: #764ba2;
    }
    .empty-state {
      text-align: center;
      padding: 30px 16px;
      border: 1px dashed rgba(102, 126, 234, 0.3);
      border-radius: 12px;
      color: #666;
    }
    @media (max-width: 768px) {
      .timeline li {
        grid-template-columns: 1fr;
        text-align: left;
      }
    }
  `,
  ],
  standalone: true,
  imports: [CommonModule],
})
export class KillTimelineComponent {
  @Input() timelineData: TimelineItem[] = [];
}
