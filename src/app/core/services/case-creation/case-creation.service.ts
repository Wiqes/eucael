import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CaseInfoService } from './case-info.service';
import { PolicyHolderService } from './policy-holder.service';
import { ServiceTypeService } from './service-type.service';
import { UploadFilesService } from './upload-files.service';
import { StateService } from '../state.service';
import { IdGeneratorService } from '../id-generator.service';
import { IOrder } from '../../models/entity/order.model';

@Injectable({ providedIn: 'root' })
export class CaseCreationService {
  private caseInfoService = inject(CaseInfoService);
  private policyHolderService = inject(PolicyHolderService);
  private serviceTypeService = inject(ServiceTypeService);
  private uploadFilesService = inject(UploadFilesService);
  private router = inject(Router);
  private stateService = inject(StateService);
  private idGenerator = inject(IdGeneratorService);

  readonly caseInfoForm = this.caseInfoService.form;
  readonly policyHolderForm = this.policyHolderService.form;
  readonly serviceTypeForm = this.serviceTypeService.form;
  readonly uploadFilesForm = this.uploadFilesService.form;

  createCase(): void {
    const caseData = this.mapFormDataToCase();
    console.log('Case created with data:', caseData);
    this.resetForms();
    this.router.navigate(['/cases']);
  }

  private mapFormDataToCase(): Partial<IOrder> {
    const { value: caseInfo } = this.caseInfoForm;
    const { value: policyHolder } = this.policyHolderForm;
    const { value: serviceType } = this.serviceTypeForm;
    const { value: uploadFiles } = this.uploadFilesForm;

    return {
      id: this.idGenerator.generateId(),
      locale: caseInfo.locale || '',
      insuranceId: caseInfo.insuranceId || '',
      claimNumberInsurance: caseInfo.claimNumberInsurance || '',
      orderDate: caseInfo.orderDate || new Date(),
      serviceProductId: serviceType.serviceProductId || '',
      claimDate: caseInfo.claimDate ? new Date(caseInfo.claimDate) : new Date(),
      insuranceCoverageId: caseInfo.insuranceCoverageId || '',
      insurancePolicyData: {
        policyHolder: {
          name: policyHolder.name || '',
          phone: policyHolder.phone || '',
          email: policyHolder.email || '',
        },
        deductibleAmount: policyHolder.deductibleAmount || 0,
        insuredAmount: policyHolder.insuredAmount || 0,
      },
      serviceLocation: {
        street: policyHolder.street || '',
        streetNumber: policyHolder.streetNumber || '',
        zipCode: policyHolder.zipCode || '',
        city: policyHolder.city || '',
        isoCountryCode: 'CH',
      },
      contact: {
        name: policyHolder.name || '',
        roleId: '',
        email: policyHolder.email || '',
        phone: policyHolder.phone || '',
      },
      claimDescription: serviceType.claimDescription || '',
      propertyTypeId: serviceType.propertyTypeId || '',
      insuranceOfficer: {
        name: '',
        phone: '',
        email: '',
      },
      serviceProviderId: serviceType.serviceProviderId || '',
      fileIds: Array.isArray(uploadFiles.fileIds)
        ? uploadFiles.fileIds.filter((id: unknown): id is string => typeof id === 'string')
        : [],
      instructions: serviceType.instructions || '',
      linkedCase: '',
    };
  }

  private resetForms(): void {
    this.caseInfoForm.reset({
      orderDate: new Date(),
      locale: this.stateService.user()?.locale || 'en-US',
    });
    this.policyHolderForm.reset();
    this.serviceTypeForm.reset();
    this.uploadFilesForm.reset();
  }
}
