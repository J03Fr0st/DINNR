import { Component, Input } from "@angular/core";
import { MatchSummary } from "../../../../core/models/index";

@Component({
  selector: "app-match-summary",
  templateUrl: "./match-summary.component.html",
  styleUrls: ["./match-summary.component.scss"],
  standalone: false,
})
export class MatchSummaryComponent {
  @Input() summary: MatchSummary | null = null;

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  getMapColor(mapName: string): string {
    const mapColors: { [key: string]: string } = {
      Erangel: "#4caf50",
      Miramar: "#ff9800",
      Sanhok: "#f44336",
      Vikendi: "#2196f3",
      Deston: "#9c27b0",
      Haven: "#795548",
    };
    return mapColors[mapName] || "#666";
  }

  getGameModeIcon(mode: string): string {
    if (mode.includes("solo")) return "person";
    if (mode.includes("duo")) return "people";
    if (mode.includes("squad")) return "groups";
    return "sports_esports";
  }
}
