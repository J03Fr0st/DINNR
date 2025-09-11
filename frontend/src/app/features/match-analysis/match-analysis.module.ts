import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ReactiveFormsModule } from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatIconModule } from "@angular/material/icon";

import { MatchAnalysisComponent } from "./match-analysis.component";
import { MatchInputComponent } from "./components/match-input/match-input.component";
import { KillTimelineComponent } from "./components/kill-timeline/kill-timeline.component";
import { PerformanceChartComponent } from "./components/performance-chart/performance-chart.component";

@NgModule({
  declarations: [MatchAnalysisComponent, MatchInputComponent, KillTimelineComponent, PerformanceChartComponent],
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
  ],
  exports: [MatchInputComponent, KillTimelineComponent, PerformanceChartComponent],
})
export class MatchAnalysisModule {}
