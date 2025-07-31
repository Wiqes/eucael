import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fantasy-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fantasy-loader.component.html',
  styleUrls: ['./fantasy-loader.component.scss'],
})
export class FantasyLoaderComponent {
  @Input() text: string = 'Loading...';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() showText: boolean = true;
}
