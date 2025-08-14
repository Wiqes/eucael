import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-profile-actions',
  imports: [TranslateModule, ButtonModule],
  templateUrl: './profile-actions.component.html',
  styleUrl: './profile-actions.component.scss',
})
export class ProfileActionsComponent {}
