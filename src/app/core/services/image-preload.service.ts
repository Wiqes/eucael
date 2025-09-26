import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, forkJoin, of, from } from 'rxjs';
import { catchError, map, timeout, switchMap } from 'rxjs/operators';
import { PRELOAD_IMAGE } from '../interceptors/auth.interceptor';

/**
 * Service to proactively fetch image assets (remote or local) so that they
 * reside in the browser's cache for faster subsequent loads.
 *
 * Strategy:
 * - Local assets: Use Image elements (more reliable with dev server cache headers)
 * - S3 assets: Use HTTP requests with custom cache headers, fallback to Image elements
 */
@Injectable({ providedIn: 'root' })
export class ImagePreloadService {
  private readonly http = inject(HttpClient);
  private loaded = new Set<string>();
  private inflight = new Map<string, Observable<[string, boolean]>>();

  /**
   * Preload a list of image URLs using the optimal strategy for each type.
   */
  preload(urls: string[]): Observable<Record<string, boolean>> {
    // Filter and validate URLs
    const validUrls = urls
      .filter((u) => u && typeof u === 'string')
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    if (!validUrls.length) {
      return of({});
    }

    console.log('ImagePreloadService: Preloading', validUrls.length, 'images');

    const requests = validUrls.map((url) => this.preloadSingle(url));

    return forkJoin(requests).pipe(
      map((entries) => {
        const result = Object.fromEntries(entries) as Record<string, boolean>;
        const successful = Object.values(result).filter(Boolean).length;
        console.log(
          `ImagePreloadService: Completed - ${successful}/${validUrls.length} images cached successfully`,
        );
        return result;
      }),
    );
  }

  /**
   * Clear the internal cache tracking.
   */
  clearCache(): void {
    this.loaded.clear();
    this.inflight.clear();
    console.log('ImagePreloadService: Cache cleared');
  }

  /**
   * Check if a specific URL has been successfully preloaded.
   */
  isLoaded(url: string): boolean {
    return this.loaded.has(url);
  }

  /**
   * Get stats about preloaded images.
   */
  getStats(): { totalLoaded: number; loadedUrls: string[] } {
    return {
      totalLoaded: this.loaded.size,
      loadedUrls: Array.from(this.loaded),
    };
  }

  private preloadSingle(url: string): Observable<[string, boolean]> {
    if (this.loaded.has(url)) {
      return of([url, true]);
    }
    if (this.inflight.has(url)) {
      return this.inflight.get(url)!;
    }

    let strategy: Observable<[string, boolean]>;

    // Choose strategy based on URL type
    if (this.isS3Url(url)) {
      // For S3 URLs: Try HTTP first (for cache headers), fallback to Image element
      strategy = this.preloadViaHttp(url).pipe(catchError(() => this.preloadViaImage(url)));
    } else {
      // For local assets: Use Image element directly (more reliable with dev server)
      strategy = this.preloadViaImage(url);
    }

    const obs = strategy.pipe(
      timeout(15000),
      catchError((error) => {
        console.warn(`ImagePreloadService: Failed to preload ${url}:`, error.message);
        return of([url, false] as [string, boolean]);
      }),
      map(([resultUrl, success]) => {
        this.inflight.delete(url);
        if (success) {
          this.loaded.add(url);
        }
        return [resultUrl, success] as [string, boolean];
      }),
    );

    this.inflight.set(url, obs);
    return obs;
  }

  private preloadViaImage(url: string): Observable<[string, boolean]> {
    return new Observable<[string, boolean]>((observer) => {
      const img = new Image();
      img.decoding = 'async';
      img.loading = 'eager';

      // Set crossOrigin for external URLs
      if (this.isExternalUrl(url)) {
        img.crossOrigin = 'anonymous';
      }

      img.onload = () => {
        observer.next([url, true]);
        observer.complete();
      };

      img.onerror = () => {
        observer.next([url, false]);
        observer.complete();
      };

      img.src = url;
    });
  }

  private preloadViaHttp(url: string): Observable<[string, boolean]> {
    return this.http
      .get(url, {
        responseType: 'blob',
        context: new HttpContext().set(PRELOAD_IMAGE, true),
      })
      .pipe(map(() => [url, true] as [string, boolean]));
  }

  private isS3Url(url: string): boolean {
    return url.includes('wiqes-images.s3.us-east-1.amazonaws.com');
  }

  private isExternalUrl(url: string): boolean {
    return url.startsWith('http') && !url.includes(window.location.origin);
  }
}
