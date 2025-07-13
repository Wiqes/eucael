import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface PresignedUrlResponse {
  uploadUrl: string;
  publicUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  constructor(private http: HttpClient) {}

  // 1. Get the pre-signed URL from NestJS
  getPresignedUrl(filename: string, contentType: string): Observable<PresignedUrlResponse> {
    return this.http.post<PresignedUrlResponse>(`${environment.API_URL}/uploads/signed-url`, {
      filename,
      contentType,
    });
  }

  // 2. Upload the file directly to S3
  uploadFileToS3(presignedUrl: string, file: File): Observable<any> {
    return this.http.put(presignedUrl, file, { reportProgress: true, observe: 'events' });
  }
}
