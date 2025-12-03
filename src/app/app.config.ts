import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

// This is the main application configuration object
export const appConfig: ApplicationConfig = {
  // Add providers for any global services or features here
  providers: [
    // Since our app doesn't currently use routing, this is optional,
    // but typically included in most apps:
    provideRouter([])
    // If you were using an API to fetch questions, you would add:
    // provideHttpClient()
  ]
};