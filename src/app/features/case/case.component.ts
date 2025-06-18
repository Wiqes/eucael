import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-case',
  standalone: true,
  imports: [],
  templateUrl: './case.component.html',
  styleUrl: './case.component.scss',
})
export class CaseComponent {
  private readonly route = inject(ActivatedRoute);
  readonly caseId = computed(() => this.route.snapshot.paramMap.get('id'));
}
