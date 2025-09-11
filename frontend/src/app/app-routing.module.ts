import { NgModule } from "@angular/core";
import { RouterModule, type Routes } from "@angular/router";

const routes: Routes = [
  { path: "", redirectTo: "/home", pathMatch: "full" },
  { path: "home", loadChildren: () => import("./features/home/home.module").then((m) => m.HomeModule) },
  {
    path: "player-stats",
    loadChildren: () => import("./features/player-stats/player-stats.module").then((m) => m.PlayerStatsModule),
  },
  {
    path: "match-analysis",
    loadChildren: () => import("./features/match-analysis/match-analysis.module").then((m) => m.MatchAnalysisModule),
  },
  { path: "**", redirectTo: "/home" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
