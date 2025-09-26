import { Component, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { PRELOAD_IMAGE } from '../../core/interceptors/auth.interceptor';

@Component({
  selector: 'app-service-worker-test-enhanced',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4">
      <h2>🔧 Service Worker & Cache Control Test</h2>

      <div class="button-group">
        <button (click)="testS3HttpClient()" class="p-button">Test S3 (HttpClient)</button>
        <button (click)="testS3Fetch()" class="p-button ml-2">Test S3 (Fetch)</button>
        <button (click)="testS3Image()" class="p-button ml-2">Test S3 (Image)</button>
        <button (click)="testS3Preload()" class="p-button ml-2">Test S3 (Preload Context)</button>
        <button (click)="testNormalRequest()" class="p-button ml-2">Test Normal Request</button>
        <button (click)="checkServiceWorker()" class="p-button ml-2">Check SW Status</button>
        <button (click)="clearLogs()" class="p-button ml-2 secondary">Clear Logs</button>
      </div>

      <div *ngIf="serviceWorkerStatus" class="mt-4">
        <h3>Service Worker Status</h3>
        <p [class]="serviceWorkerStatus.includes('activated') ? 'success' : 'warning'">
          {{ serviceWorkerStatus }}
        </p>
      </div>

      <div class="mt-4 instructions">
        <h3>📋 Testing Instructions</h3>
        <ol>
          <li>
            <strong>Check SW Status</strong>
            first to ensure service worker is active
          </li>
          <li>
            <strong>Open DevTools</strong>
            → Network tab → clear network logs
          </li>
          <li>
            <strong>Test each request type</strong>
            and examine the request headers
          </li>
          <li>
            <strong>Look for</strong>
            "Cache-Control: public, max-age=31536000, immutable" in request headers
          </li>
          <li>
            <strong>Expected behavior:</strong>
            <ul>
              <li>
                S3 requests should have Cache-Control header added by interceptor OR service worker
              </li>
              <li>Normal requests should NOT have this header</li>
              <li>All S3 request types should eventually have the header</li>
            </ul>
          </li>
        </ol>
      </div>

      <div *ngIf="requestLogs.length > 0" class="mt-4">
        <h3>📝 Request Logs</h3>
        <div class="logs">
          <div *ngFor="let log of requestLogs" [class]="log.type">
            <span class="timestamp">{{ log.timestamp }}</span>
            <span class="method">[{{ log.method }}]</span>
            <span class="message">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .p-4 {
        padding: 1rem;
      }
      .mt-4 {
        margin-top: 1rem;
      }
      .ml-2 {
        margin-left: 0.5rem;
      }

      .button-group {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }

      .p-button {
        padding: 0.5rem 1rem;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.875rem;
      }

      .p-button:hover {
        background: #2563eb;
      }

      .secondary {
        background: #6b7280;
      }

      .secondary:hover {
        background: #4b5563;
      }

      .success {
        color: #22c55e;
        font-weight: 600;
      }
      .warning {
        color: #f59e0b;
        font-weight: 600;
      }

      .instructions {
        background: #f8fafc;
        padding: 1rem;
        border-radius: 6px;
        border-left: 4px solid #3b82f6;
      }

      .instructions h3 {
        margin-top: 0;
        color: #1e40af;
      }

      .instructions ol {
        margin: 0.5rem 0;
      }

      .instructions ul {
        margin-top: 0.5rem;
        padding-left: 1rem;
      }

      .logs {
        max-height: 400px;
        overflow-y: auto;
        background: #1f2937;
        padding: 1rem;
        border-radius: 6px;
        font-family: 'SF Mono', Monaco, monospace;
        font-size: 0.875rem;
        line-height: 1.4;
      }

      .logs > div {
        margin-bottom: 0.25rem;
        display: flex;
        align-items: flex-start;
      }

      .timestamp {
        color: #9ca3af;
        margin-right: 0.5rem;
        font-size: 0.75rem;
        min-width: 70px;
      }

      .method {
        color: #fbbf24;
        margin-right: 0.5rem;
        font-weight: 600;
        min-width: 140px;
      }

      .message {
        color: #e5e7eb;
      }

      .success .message {
        color: #10b981;
      }
      .error .message {
        color: #ef4444;
      }
      .info .message {
        color: #3b82f6;
      }
    `,
  ],
})
export class ServiceWorkerTestEnhancedComponent {
  private http = inject(HttpClient);
  serviceWorkerStatus: string = '';
  requestLogs: Array<{ timestamp: string; method: string; message: string; type: string }> = [];

  private testImageUrl =
    'https://wiqes-images.s3.us-east-1.amazonaws.com/entities/panther/panther.jpg';

  private addLog(method: string, message: string, type: 'info' | 'success' | 'error' = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    this.requestLogs.unshift({ timestamp, method, message, type });
  }

  testS3HttpClient() {
    this.addLog('HttpClient', `🔄 Testing HttpClient request to S3`, 'info');

    this.http
      .get(this.testImageUrl, {
        observe: 'response',
        responseType: 'blob',
      })
      .subscribe({
        next: (response) => {
          this.addLog('HttpClient', `✅ Request completed: ${response.status}`, 'success');
          console.log('HttpClient Response headers:', response.headers);
        },
        error: (error) => {
          this.addLog(
            'HttpClient',
            `❌ Request failed: ${error.status || 'Network error'}`,
            'error',
          );
          console.log('HttpClient Request error:', error);
        },
      });
  }

  testS3Preload() {
    this.addLog('HttpClient+Preload', `🔄 Testing with PRELOAD_IMAGE context`, 'info');

    const context = new HttpContext().set(PRELOAD_IMAGE, true);

    this.http
      .get(this.testImageUrl, {
        observe: 'response',
        responseType: 'blob',
        context: context,
      })
      .subscribe({
        next: (response) => {
          this.addLog(
            'HttpClient+Preload',
            `✅ Preload request completed: ${response.status}`,
            'success',
          );
          console.log('Preload Response headers:', response.headers);
        },
        error: (error) => {
          this.addLog(
            'HttpClient+Preload',
            `❌ Preload request failed: ${error.status || 'Network error'}`,
            'error',
          );
          console.log('Preload Request error:', error);
        },
      });
  }

  testS3Fetch() {
    this.addLog('Fetch', `🔄 Testing native fetch request to S3`, 'info');

    fetch(this.testImageUrl)
      .then((response) => {
        this.addLog('Fetch', `✅ Fetch completed: ${response.status}`, 'success');
        console.log('Fetch Response:', response);
      })
      .catch((error) => {
        this.addLog('Fetch', `❌ Fetch failed: ${error.message}`, 'error');
        console.log('Fetch error:', error);
      });
  }

  testS3Image() {
    this.addLog('Image', `🔄 Testing Image element loading`, 'info');

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      this.addLog('Image', `✅ Image loaded successfully`, 'success');
      console.log('Image loaded:', img);
    };

    img.onerror = (error) => {
      this.addLog('Image', `❌ Image loading failed`, 'error');
      console.log('Image loading error:', error);
    };

    img.src = this.testImageUrl;
  }

  testNormalRequest() {
    const testUrl = 'https://jsonplaceholder.typicode.com/posts/1';
    this.addLog('Normal', `🔄 Testing normal request (should NOT have cache header)`, 'info');

    this.http.get(testUrl, { observe: 'response' }).subscribe({
      next: (response) => {
        this.addLog('Normal', `✅ Normal request completed: ${response.status}`, 'success');
        console.log('Normal Response headers:', response.headers);
      },
      error: (error) => {
        this.addLog(
          'Normal',
          `❌ Normal request failed: ${error.status || 'Network error'}`,
          'error',
        );
        console.log('Normal Request error:', error);
      },
    });
  }

  checkServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .getRegistration()
        .then((registration) => {
          if (registration) {
            const state = registration.active?.state || 'unknown';
            const scope = registration.scope;
            this.serviceWorkerStatus = `✅ Service Worker registered and ${state}. Scope: ${scope}`;
            this.addLog(
              'SW Check',
              `Service Worker is ${state}`,
              state === 'activated' ? 'success' : 'info',
            );

            // Also check if there's a controlling service worker
            if (navigator.serviceWorker.controller) {
              this.addLog('SW Check', '✅ Service Worker is controlling this page', 'success');
            } else {
              this.addLog(
                'SW Check',
                '⚠️ Service Worker registered but not controlling this page yet',
                'info',
              );
            }
          } else {
            this.serviceWorkerStatus = '❌ Service Worker not registered';
            this.addLog('SW Check', 'Service Worker not found', 'error');
          }
        })
        .catch((error) => {
          this.serviceWorkerStatus = '❌ Error checking Service Worker';
          this.addLog('SW Check', `Error: ${error.message}`, 'error');
        });
    } else {
      this.serviceWorkerStatus = '❌ Service Workers not supported';
      this.addLog('SW Check', 'Service Workers not supported in this browser', 'error');
    }
  }

  clearLogs() {
    this.requestLogs = [];
  }
}
