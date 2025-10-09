import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { StateService } from '../../core/services/state/state.service';
import { NgFor } from '@angular/common';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';
import { NgClass } from '@angular/common';
import { AnimalComponent } from './animal/animal.component';
import { IAnimal } from '../../core/models/entities/animal.model';
import { IconService } from '../../core/services/icon.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DataAccessService } from '../../core/services/data-access/data-access.service';

@Component({
  selector: 'app-embodiments',
  imports: [
    NgFor,
    ToggleSwitch,
    FormsModule,
    NgClass,
    AnimalComponent,
    MultiSelectModule,
    CommonModule,
    TranslateModule,
  ],
  templateUrl: './embodiments.component.html',
  styleUrl: './embodiments.component.scss',
})
export class EmbodimentsComponent implements OnInit {
  private readonly stateService = inject(StateService);
  protected iconService = inject(IconService);
  private translate = inject(TranslateService);
  private dataAccessService = inject(DataAccessService);
  private newLanguageSignal = toSignal(this.translate.onLangChange.asObservable());
  animals = computed(() => {
    const newLanguage = this.newLanguageSignal();
    console.log('New language:', newLanguage);
    return this.stateService.animals().map((animal) => {
      const animalName = animal.name
        ? animal.name.charAt(0).toUpperCase() + animal.name.slice(1)
        : '';
      return {
        ...animal,
        translatedName: this.translate.instant(animalName),
      } as IAnimal;
    });
  });
  isTotemShown = false;
  isDataLoading = computed(() => this.stateService.isDataLoading());
  selectedAnimals = signal<IAnimal[]>([]);
  filteredAnimals = computed(() => {
    return this.selectedAnimals().length ? this.selectedAnimals() : this.animals();
  });

  ngOnInit(): void {
    this.stateService.isDataLoading.set(true);

    const shouldFetchAnimals = this.stateService.animals().length === 0;

    if (!shouldFetchAnimals) {
      this.stateService.isDataLoading.set(false);
      return;
    }

    this.dataAccessService.getAnimals().subscribe({
      next: (animals) => {
        this.stateService.addAnimalsDataToState(animals);
      },
      error: () => this.stateService.isDataLoading.set(false),
      complete: () => this.stateService.isDataLoading.set(false),
    });
  }
}
