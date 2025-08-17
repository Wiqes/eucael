import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IUploadAvatarRequest, PresignedUrlResponse } from '../models/api-requests.model';
import { environment } from '../../../environments/environment.prod';
import { Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private http = inject(HttpClient);

  private getPresignedAvatarUrl(
    requestData: IUploadAvatarRequest,
  ): Observable<PresignedUrlResponse> {
    return this.http.post<PresignedUrlResponse>(
      `${environment.API_URL}/profile/avatar`,
      requestData,
    );
  }

  private uploadAvatarToS3(presignedUrl: string, file: File): Observable<any> {
    return this.http.put(presignedUrl, file, { reportProgress: true, observe: 'events' });
  }

  uploadAvatar(file: File): Observable<any> {
    return this.getPresignedAvatarUrl({
      filename: file.name,
      contentType: file.type,
    }).pipe(
      switchMap((res) => {
        return this.uploadAvatarToS3(res.uploadUrl, file);
      }),
    );
  }
}
