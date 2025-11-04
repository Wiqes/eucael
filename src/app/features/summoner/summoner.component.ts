import { Component, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { SummonerService } from '../../core/services/data-access/summoner.service';
import { ICreature } from '../../core/models/entities/card.model';

@Component({
  selector: 'app-summoner',
  imports: [Button, TranslateModule],
  templateUrl: './summoner.component.html',
  styleUrl: './summoner.component.scss',
})
export class SummonerComponent {
  private summonerService = inject(SummonerService);
  creature = signal<ICreature | null>(null);

  summonDarkElf() {
    this.summonerService.summon().subscribe({
      next: (creature) => {
        this.creature.set(creature);
      },
      error: (error) => {
        console.error('Error summoning creature:', error);
      },
    });
  }
}
