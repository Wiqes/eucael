import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BearIconComponent } from '../icons/bear-icon/bear-icon.component';

@Component({
  selector: 'app-icon-container',
  imports: [CommonModule, BearIconComponent],
  templateUrl: './icon-container.component.html',
  styleUrls: ['./icon-container.component.scss'],
})
export class IconContainerComponent {
  color = input<string>('green');

  containerStyle = computed(() => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '180px',
    width: '180px',
    '--icon-color': this.color(),
  }));
}
