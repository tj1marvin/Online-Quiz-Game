import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app.component'; // Assuming our component is named App

/**
 * Main entry point of the Angular application.
 * This function is responsible for bootstrapping the root component (App)
 * with the provided application configuration (appConfig).
 */
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));