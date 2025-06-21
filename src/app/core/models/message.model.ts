export interface IMessage {
  severity: string;
  summary: string;
  detail: string;
  life?: number;
}
