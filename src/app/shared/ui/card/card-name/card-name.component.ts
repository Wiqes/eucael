import { NgIf } from '@angular/common';
import { Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-card-name',
  imports: [NgIf, TranslateModule],
  templateUrl: './card-name.component.html',
  styleUrl: './card-name.component.scss',
})
export class CardNameComponent {
  name = input<string>('');
}
