import { Component, inject, OnDestroy, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { RippleModule } from 'primeng/ripple';
import { TranslateModule } from '@ngx-translate/core';
import {
  Subject,
  takeUntil,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  of,
  tap,
} from 'rxjs';
import { DataAccessService } from '../../../core/services/data-access/data-access.service';
import { IFoundUser } from '../../../core/models/entities/user.model';

@Component({
  selector: 'app-search-bar',
  imports: [ReactiveFormsModule, IconFieldModule, InputIconModule, RippleModule, TranslateModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
})
export class SearchBarComponent implements OnDestroy {
  private dataAccessService = inject(DataAccessService);
  private destroy$ = new Subject<void>();

  // Outputs
  userSelected = output<string>();

  // Search state
  searchControl = new FormControl('');
  searchResults = signal<IFoundUser[]>([]);
  isSearching = signal(false);
  showSearchResults = signal(false);

  constructor() {
    // Set up search with debounce
    this.searchControl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged(),
        tap((query) => {
          if (!query || query.trim().length < 2) {
            this.showSearchResults.set(false);
            this.searchResults.set([]);
            this.isSearching.set(false);
          } else {
            this.isSearching.set(true);
            this.showSearchResults.set(true);
          }
        }),
        debounceTime(700),
        switchMap((query) => {
          if (!query || query.trim().length < 2) {
            return of([]);
          }

          return this.dataAccessService.searchUsers(query.trim()).pipe(
            catchError((error) => {
              console.error('Search error:', error);
              this.isSearching.set(false);
              return of([]);
            }),
          );
        }),
      )
      .subscribe((results) => {
        this.searchResults.set(results);
        this.isSearching.set(false);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.showSearchResults.set(false);
    this.searchResults.set([]);
  }

  selectUser(userId: string): void {
    this.clearSearch();
    this.userSelected.emit(userId);
  }

  onSearchFocus(): void {
    if (this.searchControl.value && this.searchControl.value.trim().length >= 2) {
      this.showSearchResults.set(true);
    }
  }

  onSearchBlur(): void {
    // Delay to allow click events on search results
    setTimeout(() => {
      this.showSearchResults.set(false);
    }, 200);
  }
}
