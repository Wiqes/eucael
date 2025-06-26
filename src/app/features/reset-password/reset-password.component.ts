import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { MessageService } from '../../core/services/message.service';
import { MESSAGES } from '../../core/constants/messages';
import { ButtonModule } from 'primeng/button';
import { Location } from '@angular/common';
import { FormControlComponent } from '../../shared/ui/form-control/form-control.component';

@Component({
  selector: 'app-reset-password',
  imports: [ButtonModule, FormsModule, ReactiveFormsModule, FormControlComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  loadingResetPassword = false;
  private token = signal<string>('');
  private http = inject(HttpClient);
  private router = inject(Router);
  private location = inject(Location);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private formBuilder = inject(FormBuilder);

  form = this.formBuilder.group({
    newPassword: ['', [Validators.required]],
    confirmNewPassword: ['', [Validators.required]],
  });
  formControls = this.form.controls;

  constructor() {
    this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      console.log('Reset Password Token:', token);
      if (token) {
        this.token.set(token);
        this.location.replaceState(this.router.url.split('?')[0]);
      }
    });
  }

  resetPassword() {
    if (this.form.invalid) {
      return;
    }
    if (this.formControls['newPassword'].value !== this.formControls['confirmNewPassword'].value) {
      this.messageService.sendMessage(MESSAGES.PASSWORD_MISMATCH);
      return;
    }
    this.loadingResetPassword = true;
    this.http
      .post<any>(`${environment.API_URL}/auth/reset-password`, {
        token: this.token(),
        newPassword: this.formControls['newPassword'].value,
      })
      .subscribe({
        next: () => {
          this.messageService.sendMessage(MESSAGES.PASSWORD_RESET_SUCCESS);
          setTimeout(() => {
            this.router.navigate(['/login']);
            this.loadingResetPassword = false;
          }, 800);
        },
        error: () => {
          this.messageService.sendMessage(MESSAGES.PASSWORD_RESET_FAILED);
          this.loadingResetPassword = false;
        },
      });
  }
}
