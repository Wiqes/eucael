import { computed, effect, inject, Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { StateService } from '../state.service';

@Injectable({
  providedIn: 'root',
})
export class CaseInfoService {
  private formBuilder = inject(FormBuilder);
  private stateService = inject(StateService);
  private readonly userLocale = computed(() => this.stateService.user()?.locale || 'en-US');

  form = this.formBuilder.group({
    claimNumberInsurance: ['', Validators.required],
    locale: [this.userLocale(), Validators.required],
    insuranceId: ['', Validators.required],
    insuranceCoverageId: ['', Validators.required],
    orderDate: [{ value: new Date(), disabled: true }],
    claimDate: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      const locale = this.stateService.user()?.locale;
      if (locale && this.form.controls['locale'].value !== locale) {
        this.form.controls['locale'].setValue(locale);
      }
    });
  }
}
