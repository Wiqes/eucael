import { AfterViewInit, Directive, Input } from '@angular/core';
import { Menu } from 'primeng/menu';

@Directive({
  selector: '[appMenuPositioning]',
  standalone: true,
})
export class MenuPositioningDirective implements AfterViewInit {
  @Input('appMenuPositioning') menuClass!: string;

  constructor(private menu: Menu) {}

  ngAfterViewInit() {
    if (this.menu) {
      const originalToggle = this.menu.toggle.bind(this.menu);
      this.menu.toggle = (event: Event) => {
        originalToggle(event);
        setTimeout(() => {
          const menuElement = document.querySelector(`.p-menu.${this.menuClass}`) as HTMLElement;
          if (menuElement && this.menu.visible) {
            menuElement.style.top = '52px';
            menuElement.style.position = 'fixed';
            menuElement.style.right = '20px';
            menuElement.style.left = 'auto';
          }
        }, 0);
      };
    }
  }
}
