import { effect, inject, Injectable, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AddressService } from '../../../shared/ui/address/address.service';

@Injectable({
  providedIn: 'root',
})
export class PolicyHolderService {
  private readonly formBuilder = inject(FormBuilder);
  private readonly addressService = inject(AddressService);

  form = this.formBuilder.group({
    name: ['', Validators.required],
    phone: ['', [Validators.pattern(/^\+?[1-9]?\d{1,14}$/)]],
    email: ['', Validators.email],
    deductibleAmount: [null],
    insuredAmount: [null],
    street: ['', Validators.required],
    zipCode: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
    city: ['', Validators.required],
    streetNumber: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      const address = this.addressService.address();
      if (address) {
        this.form.patchValue({
          street: address.street,
          zipCode: address.zipCode,
          city: address.city,
          streetNumber: address.streetNumber,
        });
      }
    });
  }
}
