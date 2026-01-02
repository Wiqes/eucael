import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-victory-banner',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './victory-banner.component.html',
  styleUrls: ['./victory-banner.component.scss'],
})
export class VictoryBannerComponent {
  @Input({ required: true }) winner!: string;
}
