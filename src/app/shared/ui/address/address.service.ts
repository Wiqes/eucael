import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { IFoundAddress } from './address.model';
import { IAddress } from '../../../core/models/entity/address.model';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  private http = inject(HttpClient);
  readonly address = signal<IAddress | null>(null);

  private readonly apiUrl = 'https://api3.geo.admin.ch/rest/services/';
  private readonly searchServerUrl = `${this.apiUrl}ech/SearchServer?sr=2056&type=locations&origins=address&returnGeometry=false`;
  private readonly mapServerUrl = `${this.apiUrl}api/MapServer/ch.bfs.gebaeude_wohnungs_register/`;

  findAddress(query: string): Observable<IFoundAddress[]> {
    return this.http
      .get<any>(`${this.searchServerUrl}&searchText=${encodeURIComponent(query)}`)
      .pipe(
        map((response) =>
          (response.results ?? []).map(
            (item: any) =>
              ({
                id: item.attrs.featureId,
                label: item.attrs.label,
                query,
              } as IFoundAddress),
          ),
        ),
      );
  }

  getAddressData(featureId: string): void {
    this.http
      .get<any>(`${this.mapServerUrl}${encodeURIComponent(featureId)}`)
      .pipe(
        map((response) => {
          const attributes = response.feature?.attributes ?? {};
          return {
            street: attributes.strname?.[0] ?? '',
            zipCode: attributes.dplz4 ?? '',
            city: attributes.dplzname ?? '',
            isoCountryCode: attributes.isoCountryCode ?? '',
            streetNumber: attributes.deinr ?? '',
          } as IAddress;
        }),
      )
      .subscribe((address) => this.address.set(address));
  }
}
