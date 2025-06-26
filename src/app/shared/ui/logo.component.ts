import { Component } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="90" height="28" viewBox="0 0 90 28" fill="none">
      <!-- W  -->
      <path
        d="M1.5 6L5 22H7.5L9 14L10.5 22H13L16.5 6H13.5L11.5 16L9.5 6H7.5L5.5 16L3.5 6H1.5Z"
        fill="#00A780"
      />
      <!-- I  -->
      <rect x="18" y="6" width="3.5" height="16" rx="1.5" fill="#00A780" />
      <rect x="18" y="2" width="3.5" height="2.5" rx="1.25" fill="#00A780" />
      <!-- Q (moved left to decrease space between I and Q) -->
      <ellipse cx="31.5" cy="14" rx="6" ry="7.5" fill="none" stroke="#00A780" stroke-width="2" />
      <ellipse cx="31.5" cy="14" rx="4.5" ry="6" fill="none" stroke="#00A780" stroke-width="2" />
      <path d="M35.5 19.5L39 24" stroke="#00A780" stroke-width="2" stroke-linecap="round" />
      <!-- E (shifted right accordingly) -->
      <path
        d="M45 5.87944H54V9.54655H49.6V12.5H53.5V16.1671H49.6V18.4547H54V22.1212H45V5.87944Z"
        fill="#00A780"
      />
      <!-- S (shifted right accordingly) -->
      <path
        d="M57.5 9.5C57.5 7.01472 59.5 5.5 62.5 5.5C65.5 5.5 67.5 7 67.5 9.5C67.5 11.5 66.5 12.5 64 13.5C61.5 14.5 60.5 15.5 60.5 17C60.5 18.5 61.5 19.5 63.5 19.5C65.5 19.5 66.5 18.5 66.5 17H70.5C70.5 20.5 67.5 22.5 63.5 22.5C59.5 22.5 57.5 20.5 57.5 17.5C57.5 15.5 58.5 14.5 61 13.5C63.5 12.5 64.5 11.5 64.5 9.5C64.5 8.5 63.5 7.5 62.5 7.5C61.5 7.5 60.5 8.5 60.5 9.5H57.5Z"
        fill="#00A780"
      />
    </svg>
  `,
  styles: `
  :host {
    display: flex;
    height: 100%;
    justify-content: center;
    align-items: center;
  }`,
})
export class LogoComponent {}
