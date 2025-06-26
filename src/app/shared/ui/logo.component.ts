import { Component } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="86" height="28" viewBox="0 0 86 28" fill="none">
      <!-- W  -->
      <path
        d="M1.5 6L5 22H7.5L9 14L10.5 22H13L16.5 6H13.5L11.5 16L9.5 6H7.5L5.5 16L3.5 6H1.5Z"
        fill="#00A780"
      />
      <!-- I  -->
      <rect x="18" y="6" width="3.5" height="16" rx="1.5" fill="#00A780" />
      <rect x="18" y="2" width="3.5" height="2.5" rx="1.25" fill="#00A780" />
      <!-- Q (moved E closer by shifting Q and E left) -->
      <ellipse cx="29.5" cy="14" rx="6" ry="7.5" fill="none" stroke="#00A780" stroke-width="2" />
      <ellipse cx="29.5" cy="14" rx="4.5" ry="6" fill="none" stroke="#00A780" stroke-width="2" />
      <path d="M33.5 19.5L37 24" stroke="#00A780" stroke-width="2" stroke-linecap="round" />
      <!-- E (shifted left from x=45 to x=41) -->
      <path
        d="M41 5.87944H50V9.54655H45.6V12.5H49.5V16.1671H45.6V18.4547H50V22.1212H41V5.87944Z"
        fill="#00A780"
      />
      <!-- S (shifted left from x=57.5 to x=53.5) -->
      <path
        d="M53.5 9.5C53.5 7.01472 55.5 5.5 58.5 5.5C61.5 5.5 63.5 7 63.5 9.5C63.5 11.5 62.5 12.5 60 13.5C57.5 14.5 56.5 15.5 56.5 17C56.5 18.5 57.5 19.5 59.5 19.5C61.5 19.5 62.5 18.5 62.5 17H66.5C66.5 20.5 63.5 22.5 59.5 22.5C55.5 22.5 53.5 20.5 53.5 17.5C53.5 15.5 54.5 14.5 57 13.5C59.5 12.5 60.5 11.5 60.5 9.5C60.5 8.5 59.5 7.5 58.5 7.5C57.5 7.5 56.5 8.5 56.5 9.5H53.5Z"
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
