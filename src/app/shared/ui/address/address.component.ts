import { Component, inject, output, signal } from '@angular/core';
import {
  AutoComplete,
  AutoCompleteCompleteEvent,
  AutoCompleteSelectEvent,
} from 'primeng/autocomplete';
import { AddressService } from './address.service';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IFoundAddress } from './address.model';
import { timer, switchMap } from 'rxjs';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [CommonModule, AutoComplete, FormsModule, TranslateModule, SafeHtmlPipe],
  templateUrl: './address.component.html',
  styleUrl: './address.component.scss',
})
export class AddressComponent {
  focus = output<void>();
  items = signal<IFoundAddress[]>([]);
  label = signal('Service address');
  private addressService = inject(AddressService);

  search($event: AutoCompleteCompleteEvent) {
    timer(500)
      .pipe(switchMap(() => this.addressService.findAddress($event.query)))
      .subscribe((addresses: IFoundAddress[]) => {
        this.items.set(addresses);
      });
  }

  getAddressData($event: AutoCompleteSelectEvent) {
    this.addressService.getAddressData($event.value.id);
  }
}
