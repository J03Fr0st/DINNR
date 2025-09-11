import { NgModule } from "@angular/core";
import { RouterModule, type Routes } from "@angular/router";

const routes: Routes = [
  { path: "", redirectTo: "/home", pathMatch: "full" },
  { path: "home", loadComponent: () => import("./features/home/home.component").then((m) => m.HomeComponent) },
  {
    path: "player-stats",
    loadComponent: () => import("./features/player-stats/player-stats.component").then((m) => m.PlayerStatsComponent),
  },
  {
    path: "match-analysis",
    loadComponent: () => import("./features/match-analysis/match-analysis.component").then((m) => m.MatchAnalysisComponent),
  },
  { path: "**", redirectTo: "/home" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
