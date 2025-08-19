import { Component, computed, inject, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { MenuModule } from 'primeng/menu';
import { Menu } from 'primeng/menu';
import { NgIf } from '@angular/common';
import { ChevronDownIconComponent } from '../../../shared/ui/chevron-down-icon.component';
import { StateService } from '../../../core/services/state.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { Router } from '@angular/router';
import { LoginService } from '../../../core/services/auth/login.service';

@Component({
  selector: 'app-menu',
  imports: [SkeletonModule, MenuModule, NgIf, ChevronDownIconComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent implements OnDestroy, AfterViewInit {
  @ViewChild('menu') menu!: Menu;
  private langChangeSub: Subscription;
  private router = inject(Router);
  private stateService = inject(StateService);
  private translate = inject(TranslateService);
  private loginService = inject(LoginService);
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
        icon: 'pi pi-prime',
        label: this.translate.instant('Embodiments'),
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

  ngOnDestroy() {
    this.langChangeSub.unsubscribe();
  }

  ngAfterViewInit() {
    if (this.menu) {
      const originalToggle = this.menu.toggle.bind(this.menu);
      this.menu.toggle = (event: Event) => {
        originalToggle(event);
        setTimeout(() => {
          const menuElement = document.querySelector('.p-menu.user-menu') as HTMLElement;
          if (menuElement && this.menu.visible) {
            menuElement.style.top = '76px';
            menuElement.style.position = 'fixed';
            menuElement.style.right = '20px';
          }
        }, 0);
      };
    }
  }
}
