import { Component, Input } from '@angular/core';
import { ChipModule } from 'primeng/chip';

@Component({
  selector: 'app-stats-row',
  standalone: true,
  imports: [ChipModule],
  templateUrl: './stats-row.component.html',
  styleUrls: ['./stats-row.component.scss'],
})
export class StatsRowComponent {
  @Input({ required: true }) attack!: number;
  @Input({ required: true }) defense!: number;
}
