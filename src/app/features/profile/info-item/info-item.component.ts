import { Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-info-item',
  imports: [TranslateModule],
  templateUrl: './info-item.component.html',
  styleUrl: './info-item.component.scss',
})
export class InfoItemComponent {
  label = input<string>('');
  value = input<string>('');
}
