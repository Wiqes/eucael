import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { IUser } from '../../models/entities/user.model';
import { catchError, Observable, of } from 'rxjs';
import { IAnimal } from '../../models/entities/animal.model';
import { IColor } from '../../models/option.model';

@Injectable({
  providedIn: 'root',
})
export class DataAccessService {
  private http = inject(HttpClient);

  getUserData(): Observable<IUser | null> {
    const token = localStorage.getItem('token');
    if (!token) {
      return of(null);
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    const username = payload.username;
    return this.http.get<IUser>(`${environment.API_URL}/users/${username}`).pipe(
      catchError((error) => {
        console.error('Error fetching user data:', error.status);
        throw new Error('Failed to fetch user data');
      }),
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
}
