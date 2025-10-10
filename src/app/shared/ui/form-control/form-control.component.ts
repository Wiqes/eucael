import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { PasswordModule } from 'primeng/password';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-form-control',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Select,
    DatePickerModule,
    TranslateModule,
    TextareaModule,
    InputNumberModule,
    PasswordModule,
  ],
  templateUrl: './form-control.component.html',
  styleUrls: ['./form-control.component.scss'],
})
export class FormControlComponent {
  controlFocus = output<void>();
  label = input('');
  placeholder = input('');
  control = input<FormControl>();
  type = input<'text' | 'select' | 'date' | 'textarea' | 'number' | 'password'>('text');
  options = input<Record<string, unknown>[]>();
  optionValue = input('value');
  variant = input<'filled' | ''>('');
  private readonly languageService = inject(LanguageService);
  locale = computed(() => this.languageService.locale() || 'en-US');
}
