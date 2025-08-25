import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import {
  IUploadAvatarRequest,
  PresignedUrlResponse,
  IUpdateProfileDto,
} from '../models/api-requests.model';
import { Observable, switchMap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IProfile } from '../models/entities/profile.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private http = inject(HttpClient);

  private getPresignedAvatarUrl(
    requestData: IUploadAvatarRequest,
  ): Observable<PresignedUrlResponse> {
    return this.http.post<PresignedUrlResponse>(
      `${environment.API_URL}/uploads/avatar`,
      requestData,
    );
  }

  private uploadAvatarToS3(presignedUrl: string, file: File): Observable<HttpEvent<any>> {
    return this.http.put(presignedUrl, file, { reportProgress: true, observe: 'events' });
  }

  uploadAvatar(file: File): Observable<any> {
    const fakeProgressEvents = Array.from({ length: 20 }, (_, i) => ({
      type: HttpEventType.UploadProgress,
      loaded: i * 4,
      total: 100,
    }));

    return new Observable((observer) => {
      // Emit fake progress events
      fakeProgressEvents.forEach((event, idx) => {
        setTimeout(() => observer.next(event), idx * 150);
      });

      // Start actual upload after fake progress
      setTimeout(() => {
        const extension = file.name.split('.').pop();
        const fileName = extension ? `avatar.${extension}` : 'avatar';
        this.getPresignedAvatarUrl({
          filename: fileName,
          contentType: file.type,
        })
          .pipe(
            switchMap((res) =>
              this.uploadAvatarToS3(res.uploadUrl, file).pipe(
                map((event: HttpEvent<any>) => {
                  if (event.type === HttpEventType.UploadProgress && event.total) {
                    const adjustedLoaded = Math.round(10 + (event.loaded / event.total) * 90);
                    return { ...event, loaded: adjustedLoaded, total: 100 };
                  }
                  if (event.type === HttpEventType.Response) {
                    return { ...event, publicUrl: res.publicUrl };
                  }
                  return event;
                }),
              ),
            ),
          )
          .subscribe({
            next: (event) => observer.next(event),
            error: (err) => observer.error(err),
            complete: () => observer.complete(),
          });
      }, 100);
    });
  }

  updateProfile(updateProfileDto: IUpdateProfileDto): Observable<IProfile> {
    return this.http.put<IProfile>(`${environment.API_URL}/profiles`, updateProfileDto);
  }
}
