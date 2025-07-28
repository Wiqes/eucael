import { Component, computed, inject, signal } from '@angular/core';
import { StateService } from '../../core/services/state.service';
import { NgFor } from '@angular/common';
import { ImageModule } from 'primeng/image';
import { ImageCompareModule } from 'primeng/imagecompare';
import { ImageCompareComponent } from '../../shared/ui/image-compare/image-compare.component';
import { HomeComponent } from '../home/home.component';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-embodiments',
  imports: [
    NgFor,
    ImageModule,
    ImageCompareModule,
    ImageCompareComponent,
    ToggleSwitch,
    FormsModule,
    NgClass,
  ],
  templateUrl: './embodiments.component.html',
  styleUrl: './embodiments.component.scss',
})
export class EmbodimentsComponent extends HomeComponent {
  private readonly stateService = inject(StateService);
  animals = computed(() => this.stateService.animals());
  isTotemShown = false;
}
