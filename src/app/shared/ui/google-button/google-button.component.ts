import { Component, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { GoogleIconComponent } from '../google-icon/google-icon.component';

@Component({
  selector: 'app-google-button',
  imports: [ButtonModule, GoogleIconComponent],
  templateUrl: './google-button.component.html',
  styleUrl: './google-button.component.scss',
})
export class GoogleButtonComponent {
  click = output();
}
