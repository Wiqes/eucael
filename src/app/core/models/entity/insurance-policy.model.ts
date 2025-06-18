import { IConnection } from './connection.model';

export interface IInsurancePolicy {
  policyHolder: IConnection;
  insuredAmount?: number;
  deductibleAmount?: number;
  deductiblePercent?: number;
}
