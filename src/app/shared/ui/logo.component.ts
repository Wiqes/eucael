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
        background: #3f3f46;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        border: 1px solid #dfe7ef;
        border-radius: 5px;
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
