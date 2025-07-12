import { Component } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <img src="assets/images/logo.png" alt="Wiqes Logo" />
  `,
  styles: [
    `
      :host {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 40px;
      }

      img {
        height: 25px;
        width: 90px;
      }
    `,
  ],
})
export class LogoComponent {}
