import { Component } from '@angular/core';
import { LogoComponent } from '../../../shared/ui/logo.component';

@Component({
  selector: 'app-logo-container',
  imports: [LogoComponent],
  templateUrl: './logo-container.component.html',
  styleUrl: './logo-container.component.scss',
})
export class LogoContainerComponent {}
