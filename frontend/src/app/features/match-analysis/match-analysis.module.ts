import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatChipsModule } from "@angular/material/chips";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { RouterModule } from "@angular/router";

import { KillTimelineComponent } from "./components/kill-timeline/kill-timeline.component";
import { MatchInputComponent } from "./components/match-input/match-input.component";
import { PerformanceChartComponent } from "./components/performance-chart/performance-chart.component";
import { MatchAnalysisComponent } from "./match-analysis.component";
import { InsightsComponent } from "./components/insights/insights.component";

@NgModule({
  declarations: [
    MatchAnalysisComponent,
    MatchInputComponent,
    KillTimelineComponent,
    PerformanceChartComponent,
    InsightsComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: "", component: MatchAnalysisComponent }]),
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    MatChipsModule,
  ],
  exports: [MatchInputComponent, KillTimelineComponent, PerformanceChartComponent, InsightsComponent],
})
export class MatchAnalysisModule {}
