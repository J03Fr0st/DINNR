import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import {
  provideRouter,
  withComponentInputBinding,
  withEnabledBlockingInitialNavigation,
  withInMemoryScrolling,
  withRouterConfig,
  withViewTransitions,
  withPreloading,
} from "@angular/router";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { provideHttpClient, withInterceptors, withFetch } from "@angular/common/http";
import { PubgApiService } from "./app/core/services/pubg-api.service";
import { ErrorInterceptor } from "./app/core/interceptors/error.interceptor";
import { SmartPreloadingStrategy } from "./app/core/services/preloading.strategy";
import type { Routes } from "@angular/router";

// Modern standalone routes configuration with enhanced features
const routes: Routes = [
  { path: "", redirectTo: "/home", pathMatch: "full" },
  {
    path: "home",
    loadComponent: () => import("./app/features/home/home.component").then((m) => m.HomeComponent),
    title: "Home - DINNR PUBG Analytics",
    data: { preload: true } // Preload home route after initial load
  },
  {
    path: "player-stats",
    loadComponent: () =>
      import("./app/features/player-stats/player-stats.component").then((m) => m.PlayerStatsComponent),
    title: "Player Stats - DINNR PUBG Analytics",
    data: { preload: true } // Preload player-stats route
  },
  {
    path: "match-analysis",
    loadComponent: () =>
      import("./app/features/match-analysis/match-analysis.component").then((m) => m.MatchAnalysisComponent),
    title: "Match Analysis - DINNR PUBG Analytics",
    data: { preload: false } // Don't preload match-analysis as it's heavy
  },
  { path: "**", redirectTo: "/home" },
];

bootstrapApplication(AppComponent, {
  providers: [
    // Modern router configuration with latest features
    provideRouter(
      routes,
      withComponentInputBinding(), // Enables route params as component inputs
      withEnabledBlockingInitialNavigation(), // Better initial navigation
      withInMemoryScrolling({ scrollPositionRestoration: "top" }), // Scroll restoration
      withRouterConfig({ paramsInheritanceStrategy: "always" }), // Better param inheritance
      withViewTransitions(), // Enables smooth view transitions between routes
      withPreloading(SmartPreloadingStrategy), // Custom smart preloading strategy
    ),

    // Modern animations provider (async loading)
    provideAnimationsAsync(),

    // Modern HTTP client with fetch API and functional interceptors
    provideHttpClient(
      withFetch(), // Use fetch API instead of XMLHttpRequest
      withInterceptors([ErrorInterceptor]), // Functional interceptors
    ),

    // Services
    PubgApiService,
    SmartPreloadingStrategy,
  ],
}).catch((err) => console.error(err));
