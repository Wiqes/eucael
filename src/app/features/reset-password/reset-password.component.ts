import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-reset-password',
  imports: [],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private formBuilder = inject(FormBuilder);

  form = this.formBuilder.group({
    newPassword: ['', [Validators.required]],
    confirmNewPassword: ['', [Validators.required]],
  });
  formControls = this.form.controls;
}
