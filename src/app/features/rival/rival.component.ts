import { Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataAccessService } from '../../core/services/data-access/data-access.service';
import { IProfile } from '../../core/models/entities/profile.model';
import { NgIf } from '@angular/common';
import { StateService } from '../../core/services/state/state.service';
import { AvatarModule } from 'primeng/avatar';
import { Subject, takeUntil, switchMap, of } from 'rxjs';
import { DEFAULT_AVATAR_URL } from '../../core/constants/default-values';
import { LoaderComponent } from '../../shared/ui/loader/loader.component';

@Component({
  selector: 'app-rival',
  imports: [NgIf, AvatarModule, LoaderComponent],
  templateUrl: './rival.component.html',
  styleUrl: './rival.component.scss',
})
export class RivalComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private dataAccessService = inject(DataAccessService);
  private stateService = inject(StateService);
  isDataLoading = computed(() => this.stateService.isDataLoading());
  private destroy$ = new Subject<void>();
  isProfileLoading = signal(false);

  rivalProfile = signal<IProfile | null>(null);
  avatarUrl = computed(() => this.rivalProfile()?.avatarUrl || DEFAULT_AVATAR_URL);
  displayName = computed(
    () => this.rivalProfile()?.name || this.rivalProfile()?.email || 'Unknown',
  );
  country = computed(() => this.rivalProfile()?.country || 'Unknown');

  ngOnInit(): void {
    if (!this.isDataLoading()) {
      this.getRivalFromRouteId();
    }
  }

  private getRivalFromRouteId(): void {
    this.isProfileLoading.set(true);
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params) => {
          if (this.rivalProfile()) return of(this.rivalProfile());

          const rivalId = params.get('rivalId');
          if (rivalId) {
            return this.dataAccessService.getProfileByUserId(rivalId);
          }
          return of(null);
        }),
      )
      .subscribe({
        next: (profile) => {
          if (profile) {
            this.rivalProfile.set(profile);
          } else {
            this.rivalProfile.set(null);
          }
          this.isProfileLoading.set(false);
        },
        error: (error) => {
          console.error('Error fetching rival profile:', error);
          this.rivalProfile.set(null);
          this.isProfileLoading.set(false);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
