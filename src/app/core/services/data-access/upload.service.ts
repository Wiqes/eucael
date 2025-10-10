import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IPresignedUrlRequest, PresignedUrlResponse } from '../../models/api-requests.model';

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private http = inject(HttpClient);

  getPresignedUrl(requestData: IPresignedUrlRequest): Observable<PresignedUrlResponse> {
    return this.http.post<PresignedUrlResponse>(
      `${environment.API_URL}/uploads/signed-url`,
      requestData,
    );
  }

  uploadFileToS3(presignedUrl: string, file: File): Observable<HttpEvent<unknown>> {
    return this.http.put(presignedUrl, file, { reportProgress: true, observe: 'events' });
  }

  deleteFile(publicUrl: string): Observable<Record<string, unknown>> {
    const encodedUrl = encodeURIComponent(publicUrl);
    return this.http.delete<Record<string, unknown>>(
      `${environment.API_URL}/uploads/${encodedUrl}`,
    );
  }
}
