import { Component, computed, inject } from '@angular/core';
import { ServiceTypeService } from '../../../core/services/case-creation/service-type.service';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FormControlComponent } from '../../../shared/ui/form-control/form-control.component';
import { StateService } from '../../../core/services/state.service';
import { SERVICE_PROVIDERS } from '../../../core/constants/service-providers';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-service-type',
  imports: [ReactiveFormsModule, TranslateModule, FormControlComponent, NgIf],
  templateUrl: './service-type.component.html',
  styleUrl: './service-type.component.scss',
})
export class ServiceTypeComponent {
  private serviceTypeService = inject(ServiceTypeService);
  private stateService = inject(StateService);
  form = this.serviceTypeService.form;
  formControls = this.form.controls;

  readonly serviceProducts = computed(() => []);
  readonly propertyTypes = computed(() => []);
  readonly serviceProviders = SERVICE_PROVIDERS;
}
