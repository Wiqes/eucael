import { IInsurancePolicy } from './insurance-policy.model';
import { IAddress } from './address.model';
import { IContact } from './contact.model';
import { IConnection } from './connection.model';
import {IBaseEntity} from "./base-entity.model";

export interface IOrder extends IBaseEntity{
  locale: string;
  insuranceId: string; // UUID
  claimNumberInsurance: string;
  orderDate: Date;
  serviceProductId: string; // UUID
  claimDate: Date;
  insuranceCoverageId: string; // UUID
  insurancePolicyData: IInsurancePolicy;
  serviceLocation: IAddress;
  contact: IContact;
  claimDescription: string;
  propertyTypeId: string; // UUID
  insuranceOfficer: IConnection;
  serviceProviderId: string; // UUID
  fileIds: string[];
  instructions?: string;
  linkedCase?: string;
}
