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
  private loaded = new Set<string>();
  private inflight = new Map<string, Observable<[string, boolean]>>();

  /**
   * Preload a list of absolute/relative image URLs.
   * Uses HttpClient so the interceptor can add Cache-Control headers.
   */
  preload(urls: string[]): Observable<Record<string, boolean>> {
    // Filter out empty, null, or undefined URLs, and trim whitespace
    const validUrls = urls
      .filter((u) => u && typeof u === 'string')
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    const requests = validUrls.map((url) => this.preloadSingle(url));

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

  /**
   * Clear the internal cache of loaded images.
   * Useful when you want to force re-preloading of images.
   */
  clearCache(): void {
    this.loaded.clear();
    this.inflight.clear();
  }

  /**
   * Check if a specific URL has been successfully preloaded.
   */
  isLoaded(url: string): boolean {
    return this.loaded.has(url);
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
          this.inflight.delete(url); // Clean up inflight map
          return [url, true] as [string, boolean];
        }),
        catchError((error) => {
          // Clean up inflight map before fallback
          this.inflight.delete(url);

          console.warn(`HTTP preload failed for ${url}, falling back to Image element:`, error);

          // Fallback to Image element approach (cannot set custom headers but will still cache if allowed)
          return new Observable<[string, boolean]>((observer) => {
            const img = new Image();
            img.decoding = 'async';
            img.loading = 'eager';

            // Only set crossOrigin for external URLs (S3) to avoid CORS issues with local assets
            if (url.startsWith('http') && !url.includes(window.location.origin)) {
              img.crossOrigin = 'anonymous';
            }

            img.onload = () => {
              this.loaded.add(url);
              observer.next([url, true]);
              observer.complete();
            };
            img.onerror = (imgError) => {
              console.warn(`Image element preload also failed for ${url}:`, imgError);
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
