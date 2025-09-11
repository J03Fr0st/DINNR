import { Component, signal, computed } from "@angular/core";
import { RouterModule, type Router } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
  standalone: true,
  imports: [RouterModule, MatIconModule],
})
export class AppComponent {
  title = signal("dinnr-app");
  currentYear = signal(new Date().getFullYear());

  // Navigation items using signals
  navItems = signal([
    { path: "/home", label: "Home", active: false },
    { path: "/player-stats", label: "Player Stats", active: false },
    { path: "/match-analysis", label: "Match Analysis", active: false },
  ]);

  // Computed signal for footer text
  footerText = computed(() => `© ${this.currentYear()} DINNR. Powered by PUBG API.`);

  // Features list as signal
  features = signal(["Match Analysis", "Player Statistics", "Team Performance", "Strategic Insights"]);

  // Resources list as signal
  resources = signal([
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "Support", href: "#" },
  ]);

  // Social links as signal
  socialLinks = signal([
    { href: "#", icon: "code", label: "GitHub" },
    { href: "#", icon: "alternate_email", label: "Twitter" },
  ]);

}
