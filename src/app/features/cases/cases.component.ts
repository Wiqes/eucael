import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-cases',
  standalone: true,
  imports: [ButtonModule, TranslateModule],
  templateUrl: './cases.component.html',
  styleUrl: './cases.component.scss',
})
export class CasesComponent {
  private router = inject(Router);
  cases = [];

  onCreateCase() {
    this.router.navigate(['/case-creation']);
  }
}
