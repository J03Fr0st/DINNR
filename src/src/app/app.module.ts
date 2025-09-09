import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
import { ChartsModule } from 'ng2-charts';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { MatchInputComponent } from './features/match-analysis/components/match-input/match-input.component';
import { PlayerStatsComponent } from './features/match-analysis/components/player-stats/player-stats.component';
import { MatchSummaryComponent } from './features/match-analysis/components/match-summary/match-summary.component';
import { InsightsComponent } from './features/match-analysis/components/insights/insights.component';
import { PerformanceChartComponent } from './features/match-analysis/components/performance-chart/performance-chart.component';
import { KillTimelineComponent } from './features/match-analysis/components/kill-timeline/kill-timeline.component';
import { TeamComparisonComponent } from './features/match-analysis/components/team-comparison/team-comparison.component';

@NgModule({
  declarations: [
    AppComponent,
    MatchInputComponent,
    PlayerStatsComponent,
    MatchSummaryComponent,
    InsightsComponent,
    PerformanceChartComponent,
    KillTimelineComponent,
    TeamComparisonComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    ChartsModule,
    AppRoutingModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
