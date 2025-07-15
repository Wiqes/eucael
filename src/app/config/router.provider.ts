import { provideRouter, Routes } from '@angular/router';
import { AdminGuard } from '../core/guards/admin.guard';

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
    loadComponent: () => import('../features/cases/cases.component').then((m) => m.CasesComponent),
  },
  {
    path: 'case-creation',
    loadComponent: () =>
      import('../features/case-creation/case-creation.component').then(
        (m) => m.CaseCreationComponent,
      ),
  },
  {
    path: 'profile',
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
];

export const routerProvider = () => provideRouter(routes);
