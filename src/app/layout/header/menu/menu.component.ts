import { Component, computed, inject, OnDestroy } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { MenuModule } from 'primeng/menu';
import { NgIf } from '@angular/common';
import { ChevronDownIconComponent } from '../../../shared/ui/chevron-down-icon.component';
import { StateService } from '../../../core/services/state.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  imports: [SkeletonModule, MenuModule, NgIf, ChevronDownIconComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent implements OnDestroy {
  private langChangeSub: Subscription;
  private router = inject(Router);
  private stateService = inject(StateService);
  private translate = inject(TranslateService);
  displayName = computed(() => this.stateService.displayName());
  isDataLoading = computed(() => this.stateService.isDataLoading());

  items: any[] = [];

  constructor() {
    this.setMenuItems();
    this.langChangeSub = this.translate.onLangChange.subscribe(() => {
      this.setMenuItems();
    });
  }

  private setMenuItems() {
    this.items = [
      {
        icon: 'pi pi-user',
        label: this.translate.instant('My Profile'),
        command: () => this.router.navigate(['/profile']),
      },
      {
        icon: 'pi pi-sign-out',
        label: this.translate.instant('Log out'),
        command: () => this.logout(),
      },
    ];
  }

  logout(): void {
    localStorage.removeItem('token');
    this.stateService.user.set(null);
    this.router.navigate(['/']);
  }

  ngOnDestroy() {
    this.langChangeSub.unsubscribe();
  }
}
