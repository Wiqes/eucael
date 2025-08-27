import { DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-crop-controls',
  imports: [ButtonModule, DecimalPipe, TranslateModule],
  templateUrl: './crop-controls.component.html',
  styleUrl: './crop-controls.component.scss',
})
export class CropControlsComponent {
  zoom = input<number>(1);
  previewImage = input<string | null>(null);
  zoomIn = output<void>();
  zoomOut = output<void>();
  resetCrop = output<void>();
}
