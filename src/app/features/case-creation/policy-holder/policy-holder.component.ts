import { Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PolicyHolderService } from '../../../core/services/case-creation/policy-holder.service';
import { FormControlComponent } from '../../../shared/ui/form-control/form-control.component';
import { AddressComponent } from '../../../shared/ui/address/address.component';

@Component({
  selector: 'app-policy-holder',
  imports: [ReactiveFormsModule, TranslateModule, FormControlComponent, AddressComponent],
  templateUrl: './policy-holder.component.html',
  styleUrl: './policy-holder.component.scss',
})
export class PolicyHolderComponent {
  private policyHolderService = inject(PolicyHolderService);
  form = this.policyHolderService.form;
  formControls = this.form.controls;
  variant: 'filled' | '' = 'filled';
}
