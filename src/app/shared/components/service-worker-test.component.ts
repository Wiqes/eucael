import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-service-worker-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4">
      <h2>Service Worker Test</h2>
      <button (click)="testS3Request()" class="p-button">Test S3 Request</button>
      <button (click)="testNormalRequest()" class="p-button ml-2">Test Normal Request</button>
      <button (click)="checkServiceWorker()" class="p-button ml-2">Check SW Status</button>

      <div *ngIf="serviceWorkerStatus" class="mt-4">
        <h3>Service Worker Status</h3>
        <p>{{ serviceWorkerStatus }}</p>
      </div>

      <div *ngIf="requestLogs.length > 0" class="mt-4">
        <h3>Request Logs</h3>
        <ul>
          <li *ngFor="let log of requestLogs">{{ log }}</li>
        </ul>
      </div>
    </div>
  `,
  styles: [
    `
      .ml-2 {
        margin-left: 0.5rem;
      }
      .mt-4 {
        margin-top: 1rem;
      }
      .p-4 {
        padding: 1rem;
      }
    `,
  ],
})
export class ServiceWorkerTestComponent {
  serviceWorkerStatus: string = '';
  requestLogs: string[] = [];

  constructor(private http: HttpClient) {}

  testS3Request() {
    const testUrl = 'https://wiqes-images.s3.us-east-1.amazonaws.com/test-image.jpg';
    this.requestLogs.push(`Testing S3 request: ${testUrl}`);

    this.http.get(testUrl, { observe: 'response' }).subscribe({
      next: (response) => {
        this.requestLogs.push(`S3 Request completed: ${response.status}`);
        console.log('S3 Response headers:', response.headers);
      },
      error: (error) => {
        this.requestLogs.push(`S3 Request failed: ${error.status || 'Network error'}`);
        console.log('S3 Request error:', error);
      },
    });
  }

  testNormalRequest() {
    const testUrl = 'https://jsonplaceholder.typicode.com/posts/1';
    this.requestLogs.push(`Testing normal request: ${testUrl}`);

    this.http.get(testUrl, { observe: 'response' }).subscribe({
      next: (response) => {
        this.requestLogs.push(`Normal Request completed: ${response.status}`);
        console.log('Normal Response headers:', response.headers);
      },
      error: (error) => {
        this.requestLogs.push(`Normal Request failed: ${error.status || 'Network error'}`);
        console.log('Normal Request error:', error);
      },
    });
  }

  checkServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          this.serviceWorkerStatus = `Service Worker registered. State: ${
            registration.active?.state || 'unknown'
          }`;
          this.requestLogs.push('Service Worker is registered and active');
        } else {
          this.serviceWorkerStatus = 'Service Worker not registered';
          this.requestLogs.push('Service Worker not found');
        }
      });
    } else {
      this.serviceWorkerStatus = 'Service Workers not supported';
      this.requestLogs.push('Service Workers not supported in this browser');
    }
  }
}
