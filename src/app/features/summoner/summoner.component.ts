import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-summoner',
  imports: [Button, TranslateModule],
  templateUrl: './summoner.component.html',
  styleUrl: './summoner.component.scss',
})
export class SummonerComponent {
  summonDarkElf() {
    // Logic to summon a dark elf goes here
    console.log('Summoning a dark elf...');
  }
}
