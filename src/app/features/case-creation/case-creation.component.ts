import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-case-creation',
  imports: [ButtonModule, TranslateModule],
  templateUrl: './case-creation.component.html',
  styleUrl: './case-creation.component.scss',
})
export class CaseCreationComponent {
  createCase() {
    console.log('Creating case with data:');
  }
}
