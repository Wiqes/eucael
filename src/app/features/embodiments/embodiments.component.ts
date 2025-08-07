import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { StateService } from '../../core/services/state.service';
import { NgFor } from '@angular/common';
import { HomeComponent } from '../home/home.component';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';
import { NgClass } from '@angular/common';
import { LoaderComponent } from '../../shared/ui/loader/loader.component';
import { AnimalComponent } from './animal/animal.component';
import { IAnimal } from '../../core/models/entities/animal.model';
import { IconService } from '../../core/services/icon.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
    CommonModule,
    TranslateModule,
  ],
  templateUrl: './embodiments.component.html',
  styleUrl: './embodiments.component.scss',
})
export class EmbodimentsComponent extends HomeComponent {
  private readonly stateService = inject(StateService);
  private translate = inject(TranslateService);
  private newLanguageSignal = toSignal(this.translate.onLangChange.asObservable());
  protected iconService = inject(IconService);
  animals = computed(() => {
    const newLanguage = this.newLanguageSignal();
    return this.stateService.animals().map((animal) => {
      const animalName = animal.name
        ? animal.name.charAt(0).toUpperCase() + animal.name.slice(1)
        : '';
      return {
        ...animal,
        name: this.translate.instant(animalName),
      } as IAnimal;
    });
  });
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
