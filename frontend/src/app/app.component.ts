import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
  standalone: true,
  imports: [RouterModule, MatIconModule],
})
export class AppComponent {
  title = "dinnr-app";
}
