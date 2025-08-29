import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { GoogleIconComponent } from '../google-icon/google-icon.component';
import { environment } from '../../../../environments/environment';
import { TranslateModule } from '@ngx-translate/core';
import { FingerprintService } from '../../../core/services/fingerprint.service';

@Component({
  selector: 'app-google-button',
  imports: [ButtonModule, GoogleIconComponent, TranslateModule],
  templateUrl: './google-button.component.html',
  styleUrls: ['./google-button.component.scss'],
})
export class GoogleButtonComponent {
  private readonly fingerprintService = inject(FingerprintService);

  googleLogin() {
    window.location.href = `${
      environment.API_URL
    }/auth/google?fingerprint=${this.getFingerprint()}`;
  }

  private getFingerprint(): string {
    return this.fingerprintService.getFingerprint();
  }
}
