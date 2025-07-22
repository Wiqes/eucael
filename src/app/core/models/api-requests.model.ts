import { EntityType } from "../constants/entity-type";

export interface IPresignedUrlRequest {
  filename: string;
  contentType: string;
  entityType: EntityType;
  entityId: number;
}