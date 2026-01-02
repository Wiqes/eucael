import { Component, computed, inject, OnDestroy, ViewChild } from '@angular/core';
import { MenuModule } from 'primeng/menu';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { MenuPositioningDirective } from '../menu-positioning.directive';
import { StateService } from '../../../core/services/state/state.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { Router } from '@angular/router';
import { LoginService } from '../../../core/services/auth/login.service';

@Component({
  selector: 'app-menu',
  imports: [MenuModule, MenuPositioningDirective],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent implements OnDestroy {
  @ViewChild('menu') menu!: Menu;
  private langChangeSub: Subscription;
  private router = inject(Router);
  private stateService = inject(StateService);
  private translate = inject(TranslateService);
  private loginService = inject(LoginService);
  displayName = computed(() => this.stateService.displayName());
  isDataLoading = computed(() => this.stateService.isDataLoading());

  items: MenuItem[] = [];

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
        icon: 'pi pi-comment',
        label: this.translate.instant('Messages'),
        command: () => this.router.navigate(['/messages']),
      },
      {
        icon: 'pi pi-star',
        label: this.translate.instant('Battle'),
        command: () => this.router.navigate(['/battle']),
      },
      {
        icon: 'pi pi-bullseye',
        label: this.translate.instant('Summoner'),
        command: () => this.router.navigate(['/summoner']),
      },
      {
        icon: 'pi pi-objects-column',
        label: this.translate.instant('Dark Elves'),
        command: () => this.router.navigate(['/embodiments']),
      },
      {
        icon: 'pi pi-sign-out',
        label: this.translate.instant('Log out'),
        command: () => this.logout(),
      },
    ];
  }

  logout(): void {
    this.loginService.logout();
  }

  toggle(event: Event): void {
    if (this.menu) {
      this.menu.toggle(event);
    }
  }

  ngOnDestroy() {
    this.langChangeSub.unsubscribe();
  }
}
