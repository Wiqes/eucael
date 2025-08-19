import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { IUploadAvatarRequest, PresignedUrlResponse } from '../models/api-requests.model';
import { Observable, switchMap, map, startWith, delay } from 'rxjs';
import { environment } from '../../../environments/environment';

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
    let publicUrl: string;

    // Create fake progress events for initial setup
    const fakeProgressEvents = [
      { type: HttpEventType.UploadProgress, loaded: 0, total: 100 },
      { type: HttpEventType.UploadProgress, loaded: 5, total: 100 },
      { type: HttpEventType.UploadProgress, loaded: 10, total: 100 },
      { type: HttpEventType.UploadProgress, loaded: 15, total: 100 },
      { type: HttpEventType.UploadProgress, loaded: 20, total: 100 },
      { type: HttpEventType.UploadProgress, loaded: 25, total: 100 },
      { type: HttpEventType.UploadProgress, loaded: 30, total: 100 },
      { type: HttpEventType.UploadProgress, loaded: 35, total: 100 },
    ];

    return new Observable((observer) => {
      // Emit fake initial progress immediately
      observer.next(fakeProgressEvents[0]);

      // Emit more fake progress with small delays
      setTimeout(() => observer.next(fakeProgressEvents[1]), 400);
      setTimeout(() => observer.next(fakeProgressEvents[2]), 800);
      setTimeout(() => observer.next(fakeProgressEvents[3]), 1200);
      setTimeout(() => observer.next(fakeProgressEvents[4]), 1600);
      setTimeout(() => observer.next(fakeProgressEvents[5]), 2000);
      setTimeout(() => observer.next(fakeProgressEvents[6]), 2400);
      setTimeout(() => observer.next(fakeProgressEvents[7]), 2800);

      // Start the actual upload process
      this.getPresignedAvatarUrl({
        filename: 'avatar',
        contentType: file.type,
      })
        .pipe(
          switchMap((res) => {
            publicUrl = res.publicUrl;
            return this.uploadAvatarToS3(res.uploadUrl, file);
          }),
          map((event: HttpEvent<any>) => {
            // Adjust progress to account for fake initial progress (10%)
            if (event.type === HttpEventType.UploadProgress && event.total) {
              const adjustedLoaded = Math.round(10 + (event.loaded / event.total) * 90);
              return { ...event, loaded: adjustedLoaded, total: 100 };
            } else if (event.type === HttpEventType.Response) {
              return { ...event, publicUrl };
            }
            return event;
          }),
        )
        .subscribe({
          next: (event) => observer.next(event),
          error: (error) => observer.error(error),
          complete: () => observer.complete(),
        });
    });
  }
}
