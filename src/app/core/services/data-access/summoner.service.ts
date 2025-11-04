import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { catchError, Observable } from 'rxjs';
import { ICreature } from '../../models/entities/card.model';

@Injectable({
  providedIn: 'root',
})
export class SummonerService {
  private http = inject(HttpClient);

  summon(): Observable<ICreature> {
    return this.http.get<ICreature>(`${environment.API_URL}/summoner/summon`).pipe(
      catchError((error) => {
        console.error('Error summoning creature:', error.status);
        throw new Error('Failed to summon creature');
      }),
    );
  }
}
