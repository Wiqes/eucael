import { Component, computed, inject, signal } from '@angular/core';
import { StateService } from '../../core/services/state.service';
import { NgFor } from '@angular/common';
import { HomeComponent } from '../home/home.component';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { CardComponent } from '../../shared/ui/card/card.component';

@Component({
  selector: 'app-embodiments',
  imports: [NgFor, ToggleSwitch, FormsModule, NgClass, SkeletonModule, NgIf, CardComponent],
  templateUrl: './embodiments.component.html',
  styleUrl: './embodiments.component.scss',
})
export class EmbodimentsComponent extends HomeComponent {
  private readonly stateService = inject(StateService);
  animals = computed(() => this.stateService.animals());
  isTotemShown = false;
  isDataLoading = computed(() => this.stateService.isDataLoading());
}
