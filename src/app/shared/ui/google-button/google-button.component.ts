import { Component, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-google-button',
  imports: [ButtonModule],
  templateUrl: './google-button.component.html',
  styleUrl: './google-button.component.scss',
})
export class GoogleButtonComponent {
  click = output();
}
