import { Component, Input } from "@angular/core";
import { PlayerAnalysis, WeaponStats } from "../../../../core/models/index";

@Component({
  selector: "app-player-stats",
  templateUrl: "./player-stats.component.html",
  styleUrls: ["./player-stats.component.scss"],
  standalone: false,
})
export class PlayerStatsComponent {
  @Input() players: PlayerAnalysis[] = [];

  // Make Math and Object available to template
  Math = Math;
  Object = Object;

  // Helper method to safely cast weapon stats
  getWeaponStats(weapons: any): WeaponStats {
    return weapons as WeaponStats;
  }

  getPerformanceColor(rating: number): string {
    if (rating >= 4) return "green";
    if (rating >= 3) return "orange";
    return "red";
  }

  getPerformanceText(rating: number): string {
    if (rating >= 5) return "Excellent";
    if (rating >= 4) return "Good";
    if (rating >= 3) return "Average";
    if (rating >= 2) return "Below Average";
    return "Poor";
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  formatDistance(meters: number): string {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)}km`;
    }
    return `${Math.round(meters)}m`;
  }

  getKDColor(kd: number): string {
    if (kd >= 3) return "green";
    if (kd >= 2) return "orange";
    if (kd >= 1) return "yellow";
    return "red";
  }
}
