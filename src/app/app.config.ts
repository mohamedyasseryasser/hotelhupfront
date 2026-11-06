import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners
} from '@angular/core';

import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { authInterceptor } from './Interceptor/authinterceptor-interceptor';
 
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners( ),
    provideRouter(routes),provideHttpClient(withInterceptors([authInterceptor]))
   ]
};
