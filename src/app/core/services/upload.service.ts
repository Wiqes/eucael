import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface PresignedUrlResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  constructor(private http: HttpClient) {}

  getPresignedUrl(filename: string, contentType: string): Observable<PresignedUrlResponse> {
    return this.http.post<PresignedUrlResponse>(`${environment.API_URL}/uploads/signed-url`, {
      filename,
      contentType,
    });
  }

  uploadFileToS3(presignedUrl: string, file: File): Observable<any> {
    return this.http.put(presignedUrl, file, { reportProgress: true, observe: 'events' });
  }

  deleteFile(key: string): Observable<any> {
    return this.http.delete(`${environment.API_URL}/uploads/${key}`);
  }
}
