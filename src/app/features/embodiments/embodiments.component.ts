import { Component, computed, effect, inject, signal } from '@angular/core';
import { StateService } from '../../core/services/state.service';
import { NgFor } from '@angular/common';
import { HomeComponent } from '../home/home.component';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { NgClass } from '@angular/common';
import { LoaderComponent } from '../../shared/ui/loader/loader.component';
import { AnimalComponent } from './animal/animal.component';
import { IAnimal } from '../../core/models/entities/animal.model';

@Component({
  selector: 'app-embodiments',
  imports: [
    NgFor,
    ToggleSwitch,
    FormsModule,
    NgClass,
    LoaderComponent,
    AnimalComponent,
    MultiSelectModule,
  ],
  templateUrl: './embodiments.component.html',
  styleUrl: './embodiments.component.scss',
})
export class EmbodimentsComponent extends HomeComponent {
  private readonly stateService = inject(StateService);
  animals = computed(() => this.stateService.animals());
  isTotemShown = false;
  isDataLoading = computed(() => this.stateService.isDataLoading());
  selectedAnimals = signal<IAnimal[]>([]);
  filteredAnimals = computed(() => {
    return this.selectedAnimals().length ? this.selectedAnimals() : this.animals();
  });

  constructor() {
    super();
    this.stateService.addBackendDataToState();

    effect(() => {
      const selectedAnimals = this.selectedAnimals();
      console.log('Selected Animals:', selectedAnimals);
    });
  }
}
