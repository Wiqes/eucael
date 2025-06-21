import { Component, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { GoogleIconComponent } from '../google-icon/google-icon.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-google-button',
  imports: [ButtonModule, GoogleIconComponent],
  templateUrl: './google-button.component.html',
  styleUrls: ['./google-button.component.scss'],
})
export class GoogleButtonComponent {
  googleLogin() {
    window.location.href = `${environment.API_URL}/auth/google`;
  }
}
