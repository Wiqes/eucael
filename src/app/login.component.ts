import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, DialogModule, InputTextModule, ButtonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  username = '';
  password = '';
  regUsername = '';
  regPassword = '';
  showRegister = false;

  constructor(private http: HttpClient, private router: Router) {}

  login() {
    this.http
      .post<any>('https://alseids-be.onrender.com/auth/login', {
        username: this.username,
        password: this.password,
      })
      .subscribe({
        next: () => this.router.navigate(['/home']),
        error: (err) => alert(err.error?.message || 'Login failed'),
      });
  }

  register() {
    this.http
      .post<any>('https://alseids-be.onrender.com/auth/register', {
        username: this.regUsername,
        password: this.regPassword,
      })
      .subscribe({
        next: () => {
          this.showRegister = false;
          alert('Registration successful! Please login.');
        },
        error: (err) => alert(err.error?.message || 'Registration failed'),
      });
  }
}
