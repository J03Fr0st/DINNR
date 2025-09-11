import type { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { throwError } from "rxjs";
import { catchError, retry } from "rxjs/operators";

// Modern functional interceptor approach
export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    retry(1),
    catchError((error: HttpErrorResponse) => {
      let errorMessage = "An error occurred";

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Client-side error: ${error.error.message}`;
      } else {
        switch (error.status) {
          case 400:
            errorMessage = "Bad request. Please check your input.";
            break;
          case 401:
            errorMessage = "Unauthorized. Please check your API key.";
            break;
          case 403:
            errorMessage = "Forbidden. Access denied.";
            break;
          case 404:
            errorMessage = "Resource not found.";
            break;
          case 429:
            errorMessage = "Too many requests. Please try again later.";
            break;
          case 500:
            errorMessage = "Internal server error. Please try again later.";
            break;
          case 503:
            errorMessage = "Service unavailable. Please try again later.";
            break;
          default:
            errorMessage = `Server returned code: ${error.status}, error message is: ${error.message}`;
        }
      }

      console.error("API Error:", {
        url: req.url,
        status: error.status,
        message: errorMessage,
        error: error.error,
      });

      return throwError(() => new Error(errorMessage));
    }),
  );
};
