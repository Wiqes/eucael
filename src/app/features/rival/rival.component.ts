import { Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataAccessService } from '../../core/services/data-access/data-access.service';
import { IProfile } from '../../core/models/entities/profile.model';
import { NgIf } from '@angular/common';
import { StateService } from '../../core/services/state/state.service';
import { AvatarModule } from 'primeng/avatar';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-rival',
  imports: [NgIf, AvatarModule],
  templateUrl: './rival.component.html',
  styleUrl: './rival.component.scss',
})
export class RivalComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private dataAccessService = inject(DataAccessService);
  private destroy$ = new Subject<void>();
  isDataLoading = signal(false);

  rivalProfile = signal<IProfile | null>(null);
  avatarUrl = computed(() => this.rivalProfile()?.avatarUrl || '');
  displayName = computed(
    () => this.rivalProfile()?.name || this.rivalProfile()?.email || 'Unknown',
  );
  country = computed(() => this.rivalProfile()?.country || 'Unknown');

  ngOnInit(): void {
    this.isDataLoading.set(true);
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      console.log('RivalComponent initialized with rivalId:', params.get('rivalId'));
      const rivalId = params.get('rivalId');
      if (rivalId) {
        this.dataAccessService.getProfileByUserId(rivalId).subscribe(
          (profile) => {
            this.rivalProfile.set(profile);
            this.isDataLoading.set(false);
          },
          (error) => {
            console.error('Error fetching rival profile:', error);
            this.isDataLoading.set(false);
          },
        );
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
