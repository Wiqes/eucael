import {
  Component,
  computed,
  inject,
  AfterViewInit,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { StateService } from '../../core/services/state.service';
import { NgFor } from '@angular/common';
import { ImageModule } from 'primeng/image';
import { ImageCompareModule } from 'primeng/imagecompare';
import { ImageCompareComponent } from '../../shared/ui/image-compare/image-compare.component';

@Component({
  selector: 'app-embodiments',
  imports: [NgFor, ImageModule, ImageCompareModule, ImageCompareComponent],
  templateUrl: './embodiments.component.html',
  styleUrl: './embodiments.component.scss',
})
export class EmbodimentsComponent {
  private readonly stateService = inject(StateService);
  animals = computed(() => this.stateService.animals());
}
