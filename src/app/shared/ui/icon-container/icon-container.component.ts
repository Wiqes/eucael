import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BearIconComponent } from '../icons/bear-icon/bear-icon.component';
import { FoxIconComponent } from '../icons/fox-icon/fox-icon.component';

@Component({
  selector: 'app-icon-container',
  imports: [CommonModule, BearIconComponent, FoxIconComponent],
  templateUrl: './icon-container.component.html',
  styleUrls: ['./icon-container.component.scss'],
})
export class IconContainerComponent {
  color = input<string>('green');
  iconName = input<string>('bear'); // Default icon
  iconComponent = computed(() => {
    switch (this.iconName()) {
      case 'fox':
        return FoxIconComponent;
      case 'bear':
      default:
        return BearIconComponent;
    }
  });

  containerStyle = computed(() => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '180px',
    width: '180px',
    '--icon-color': this.color(),
    position: 'relative',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${this.color()}20, ${this.color()}40, ${this.color()}10)`,
    backdropFilter: 'blur(10px)',
    border: `2px solid ${this.color()}40`,
    boxShadow: `
      0 8px 32px ${this.color()}30,
      0 4px 16px ${this.color()}20,
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      inset 0 -1px 0 rgba(0, 0, 0, 0.1)
    `,
    overflow: 'hidden',
  }));
}
