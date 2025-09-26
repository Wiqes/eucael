import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PRELOAD_IMAGE } from '../interceptors/auth.interceptor';

/**
 * Service to proactively fetch image assets (remote or local) so that they
 * reside in the browser's HTTP cache with a long-lived immutable policy.
 */
@Injectable({ providedIn: 'root' })
export class ImagePreloadService {
  private readonly http = inject(HttpClient);
  images = signal<string[]>([]);

  /**
   * Preload a list of absolute/relative image URLs.
   * Uses HttpClient so the interceptor can add Cache-Control headers.
   */
  private loaded = new Set<string>();
  private inflight = new Map<string, Observable<[string, boolean]>>();

  preload(urls: string[]): Observable<Record<string, boolean>> {
    const requests = urls.filter((u) => !!u).map((url) => this.preloadSingle(url));

    if (!requests.length) {
      return new Observable<Record<string, boolean>>((observer) => {
        observer.next({});
        observer.complete();
      });
    }

    return forkJoin(requests).pipe(
      map((entries) => Object.fromEntries(entries) as Record<string, boolean>),
    );
  }

  private preloadSingle(url: string): Observable<[string, boolean]> {
    if (this.loaded.has(url)) {
      return of([url, true]);
    }
    if (this.inflight.has(url)) {
      return this.inflight.get(url)!;
    }

    const obs = this.http
      .get(url, {
        responseType: 'blob',
        context: new HttpContext().set(PRELOAD_IMAGE, true),
      })
      .pipe(
        map(() => {
          this.loaded.add(url);
          return [url, true] as [string, boolean];
        }),
        catchError(() => {
          // Fallback to Image element approach (cannot set custom headers but will still cache if allowed)
          return new Observable<[string, boolean]>((observer) => {
            const img = new Image();
            img.decoding = 'async';
            img.loading = 'eager';
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              this.loaded.add(url);
              observer.next([url, true]);
              observer.complete();
            };
            img.onerror = () => {
              observer.next([url, false]);
              observer.complete();
            };
            img.src = url;
          });
        }),
      );

    this.inflight.set(url, obs);
    return obs;
  }
}
