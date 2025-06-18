export interface IAccount {
  id: string;
  name: string;
  email: string;
  domain: string;
  tenant: string;
  type: string;
  status: string;
  address: string | null;
  imageId: string | null;
  root: boolean;
}
