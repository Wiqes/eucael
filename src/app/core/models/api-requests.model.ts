import { EntityType } from '../constants/entity-type';

export interface IPresignedUrlRequest {
  filename: string;
  contentType: string;
  entityType: EntityType;
  entityId: number;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  publicUrl: string;
}

export interface IUploadAvatarRequest {
  filename: string;
  contentType: string;
}
