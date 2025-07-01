import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { IUser } from '../models/user.model';
import { catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataAccessService {
  private http = inject(HttpClient);

  getUserData(): Observable<IUser> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No JWT token found in local storage');
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    const username = payload.username;
    return this.http.get<IUser>(`${environment.API_URL}/users/${username}`).pipe(
      catchError((error) => {
        console.error('Error fetching user data:', error);
        throw new Error('Failed to fetch user data');
      }),
    );
  }
}
