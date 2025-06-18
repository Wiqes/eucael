import { Component, inject, computed } from '@angular/core';
import { CaseCreationService } from '../../../core/services/case-creation/case-creation.service';
import { StateService } from '../../../core/services/state.service';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FormControlComponent } from '../../../shared/ui/form-control/form-control.component';

@Component({
  selector: 'app-case-info',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, FormControlComponent],
  templateUrl: './case-info.component.html',
  styleUrl: './case-info.component.scss',
})
export class CaseInfoComponent {
  private caseCreationService = inject(CaseCreationService);
  private stateService = inject(StateService);

  form = this.caseCreationService.caseInfoForm;
  formControls = this.form.controls;

  readonly locales = [
    { name: 'English', value: 'en-US' },
    { name: 'Deutsch', value: 'de-CH' },
    { name: 'Italiano', value: 'it-CH' },
    { name: 'Français', value: 'fr-CH' },
  ];

  readonly accounts = computed(() => []);
  readonly insuranceCoverages = computed(() => []);
}
