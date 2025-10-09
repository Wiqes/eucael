import { computed, inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { IUser } from '../../models/entities/user.model';
import { catchError, map, Observable, of } from 'rxjs';
import { IAnimal } from '../../models/entities/animal.model';
import { IColor } from '../../models/option.model';
import { IProfile } from '../../models/entities/profile.model';
import { AuthTokenStateService } from '../state/auth-token-state.service';
import { Base64Service } from '../base64.service';

@Injectable({
  providedIn: 'root',
})
export class DataAccessService {
  private http = inject(HttpClient);
  private authTokenStateService = inject(AuthTokenStateService);
  private readonly base64Service = inject(Base64Service);
  private token = computed(() => this.authTokenStateService.token());

  getUserData(): Observable<IUser | null> {
    const token = this.token();
    if (!token) {
      return of(null);
    }

    const payload = JSON.parse(this.base64Service.decode(token.split('.')[1]));
    const username = payload.username;
    return this.http.get<IUser>(`${environment.API_URL}/users/${username}`).pipe(
      catchError((error) => {
        console.error('Error fetching user data:', error.status);
        throw new Error('Failed to fetch user data');
      }),
    );
  }

  getUserId(): Observable<string> {
    return this.getUserData().pipe(
      map((user) => user?.id || ''),
      catchError(() => of('')),
    );
  }

  getAnimals(): Observable<IAnimal[]> {
    return this.http.get<IAnimal[]>(`${environment.API_URL}/animals`).pipe(
      catchError((error) => {
        console.error('Error fetching animals:', error.status);
        throw new Error('Failed to fetch animals');
      }),
    );
  }

  getColors(): Observable<IColor[]> {
    return this.http.get<IColor[]>(`${environment.API_URL}/colors`).pipe(
      catchError((error) => {
        console.error('Error fetching colors:', error.status);
        throw new Error('Failed to fetch colors');
      }),
    );
  }

  getProfileByUserId(userId: string): Observable<IProfile> {
    return this.http.get<IProfile>(`${environment.API_URL}/profiles/${userId}`).pipe(
      catchError((error) => {
        console.error('Error fetching profile by user ID:', error.status);
        throw new Error('Failed to fetch profile by user ID');
      }),
    );
  }
}
