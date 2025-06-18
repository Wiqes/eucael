import { Component, inject, OnDestroy, signal, Type } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { StepperComponent } from './stepper/stepper.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { CaseInfoComponent } from './case-info/case-info.component';
import { ServiceTypeComponent } from './service-type/service-type.component';
import { PolicyHolderComponent } from './policy-holder/policy-holder.component';
import { UploadFilesComponent } from './upload-files/upload-files.component';
import { CaseCreationService } from '../../core/services/case-creation/case-creation.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-case-creation',
  imports: [ButtonModule, StepperComponent, TranslateModule],
  templateUrl: './case-creation.component.html',
  styleUrl: './case-creation.component.scss',
})
export class CaseCreationComponent implements OnDestroy {
  private langChangeSub: Subscription;
  steps = signal<{ label: string; contentComponent: Type<any>; form: FormGroup }[]>([]);
  private translate = inject(TranslateService);
  private caseCreationService = inject(CaseCreationService);

  constructor() {
    this.setSteps();
    this.langChangeSub = this.translate.onLangChange.subscribe(() => this.setSteps());
  }

  private setSteps() {
    this.steps.set([
      {
        label: this.translate.instant('Case info'),
        contentComponent: CaseInfoComponent,
        form: this.caseCreationService.caseInfoForm,
      },
      {
        label: this.translate.instant('Service type'),
        contentComponent: ServiceTypeComponent,
        form: this.caseCreationService.serviceTypeForm,
      },
      {
        label: this.translate.instant('Policy holder details'),
        contentComponent: PolicyHolderComponent,
        form: this.caseCreationService.policyHolderForm,
      },
      {
        label: this.translate.instant('Upload files'),
        contentComponent: UploadFilesComponent,
        form: this.caseCreationService.uploadFilesForm,
      },
    ]);
  }

  createCase() {
    this.caseCreationService.createCase();
  }

  ngOnDestroy() {
    this.langChangeSub.unsubscribe();
  }
}
