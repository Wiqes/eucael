import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TranslateModule } from '@ngx-translate/core';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { StateService } from '../../../core/services/state.service';

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
  ],
  templateUrl: './form-control.component.html',
  styleUrls: ['./form-control.component.scss'],
})
export class FormControlComponent {
  focus = output<void>();
  label = input('');
  placeholder = input('');
  control = input<FormControl>();
  type = input<'text' | 'select' | 'date' | 'textarea' | 'number'>('text');
  options = input<any[]>();
  optionValue = input('value');
  variant = input<'filled' | ''>('');
  private readonly stateService = inject(StateService);
  locale = computed(() => this.stateService.locale() || 'en-US');
}
