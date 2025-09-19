import { Component, input } from "@angular/core";
import type { AnalysisInsights } from "../../../../core/models/index";
import { MatCardModule } from "@angular/material/card";
import { MatChipsModule } from "@angular/material/chips";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";

@Component({
  selector: "app-insights",
  templateUrl: "./insights.component.html",
  styleUrls: ["./insights.component.scss"],
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule, MatIconModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class InsightsComponent {
  insights = input<AnalysisInsights | null>(null);

  getOverallQualityColor(rating: number): string {
    if (rating >= 4) return "excellent";
    if (rating >= 3) return "good";
    if (rating >= 2) return "average";
    return "poor";
  }

  getOverallQualityText(rating: number): string {
    if (rating >= 4) return "Excellent";
    if (rating >= 3) return "Good";
    if (rating >= 2) return "Average";
    return "Poor";
  }

  getTeamPerformanceColor(rating: number): string {
    if (rating >= 4) return "excellent";
    if (rating >= 3) return "good";
    if (rating >= 2) return "average";
    return "poor";
  }

  getMomentIcon(type: string): string {
    switch (type) {
      case "kill":
        return "military_tech";
      case "death":
        return "skull";
      case "revive":
        return "healing";
      case "escape":
        return "directions_run";
      case "zone_close":
        return "warning";
      default:
        return "star";
    }
  }

  getMomentColor(type: string): string {
    switch (type) {
      case "kill":
        return "kill";
      case "death":
        return "death";
      case "revive":
        return "revive";
      case "escape":
        return "escape";
      case "zone_close":
        return "warning";
      default:
        return "default";
    }
  }

  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  }
}
