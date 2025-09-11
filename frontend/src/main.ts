import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { provideRouter } from "@angular/router";
import { AppRoutingModule } from "./app/app-routing.module";
import { importProvidersFrom } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { PubgApiService } from "./app/core/services/pubg-api.service";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { ErrorInterceptor } from "./app/core/interceptors/error.interceptor";

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(AppRoutingModule, BrowserAnimationsModule),
    provideHttpClient(withInterceptorsFromDi()),
    PubgApiService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
  ],
}).catch((err) => console.error(err));
