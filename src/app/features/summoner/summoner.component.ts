import { Component, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { SummonerService } from '../../core/services/data-access/summoner.service';
import { ICreature } from '../../core/models/entities/card.model';
import { CardComponent } from '../../shared/ui/card/card.component';
import { ISummonerResponse } from '../../core/models/summoner.model';

@Component({
  selector: 'app-summoner',
  imports: [Button, TranslateModule, CardComponent],
  templateUrl: './summoner.component.html',
  styleUrl: './summoner.component.scss',
})
export class SummonerComponent {
  private summonerService = inject(SummonerService);
  creature = signal<ICreature | null>(null);
  isSummoning = signal(false);

  summonDarkElf() {
    this.isSummoning.set(true);
    this.summonerService.summon().subscribe({
      next: (response) => {
        const creature = (response as ISummonerResponse).creature || (response as ICreature);
        this.creature.set(creature);
      },
      error: (error) => {
        console.error('Error summoning creature:', error);
      },
      complete: () => {
        this.isSummoning.set(false);
      },
    });
  }
}
