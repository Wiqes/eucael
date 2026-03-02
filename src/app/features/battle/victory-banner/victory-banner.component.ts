import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-victory-banner',
  standalone: true,
  imports: [CommonModule, ButtonModule, TranslateModule],
  templateUrl: './victory-banner.component.html',
  styleUrls: ['./victory-banner.component.scss'],
})
export class VictoryBannerComponent {
  @Input({ required: true }) winner!: string;
  @Output() readonly terminateBattle = new EventEmitter<void>();

  onTerminateBattle(): void {
    this.terminateBattle.emit();
  }
}
