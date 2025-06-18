import { inject, Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServiceTypeService {
  private formBuilder = inject(FormBuilder);
  private serviceProductIdToShowProvider = '4396bcee-5502-4f25-804c-d0a31e0a7c7b';
  private subscription: Subscription;

  form = this.formBuilder.group({
    serviceProductId: ['', Validators.required],
    serviceProviderId: [{ value: '', disabled: true }],
    claimDescription: ['', Validators.required],
    propertyTypeId: ['', Validators.required],
    instructions: ['', Validators.required],
  });

  constructor() {
    this.subscription = this.form.controls['serviceProductId'].valueChanges.subscribe((value) => {
      if (value === this.serviceProductIdToShowProvider) {
        this.form.controls['serviceProviderId'].enable();
      } else {
        this.form.controls['serviceProviderId'].disable();
        this.form.controls['serviceProviderId'].setValue('');
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
