import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TableModule, ProgressSpinnerModule, NgIf],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [MessageService],
})
export class HomeComponent {
  users: any[] = [];
  loading = true;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private messageService: MessageService,
  ) {
    // Check for Google OAuth token in URL
    this.route.queryParams.subscribe((params) => {
      const token = params['access_token'];
      if (token) {
        try {
          window.localStorage.setItem('token', token);
        } catch (e) {
          this.messageService.add({
            severity: 'error',
            summary: 'Storage Error',
            detail: 'Unable to save token. Please check your browser settings.',
          });
        }
        this.messageService.add({
          severity: 'success',
          summary: 'Login Successful',
          detail: 'Welcome! You are now logged in with Google.',
        });
        // Remove token from URL for cleanliness
        this.location.replaceState(this.router.url.split('?')[0]);
      }
      this.fetchUsers();
    });
  }

  private fetchUsers() {
    this.loading = true;
    this.http.get<any[]>('https://alseids-be.onrender.com/users').subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
