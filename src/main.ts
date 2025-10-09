import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/config/config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    console.log('Angular app bootstrapped successfully');
  })
  .catch((err) => console.error(err));
