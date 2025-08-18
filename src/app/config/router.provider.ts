import { provideRouter, Routes } from '@angular/router';
import { AdminGuard } from '../core/guards/admin.guard';
import { AuthGuard } from '../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    outlet: 'header',
    loadComponent: () => import('../layout/header/header.component').then((m) => m.HeaderComponent),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('../features/turnskins/turnskins.component').then((m) => m.TurnskinsComponent),
  },
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('../features/profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('../features/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent,
      ),
  },
  {
    path: 'admin',
    canActivate: [AdminGuard],
    loadComponent: () => import('../features/admin/admin.component').then((m) => m.AdminComponent),
  },
  {
    path: 'turnskins',
    loadComponent: () =>
      import('../features/turnskins/turnskins.component').then((m) => m.TurnskinsComponent),
  },
];

export const routerProvider = () => provideRouter(routes);
