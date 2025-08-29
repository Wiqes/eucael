import { provideRouter, Routes } from '@angular/router';
import { AdminGuard } from '../core/guards/admin.guard';
import { AuthGuard } from '../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../features/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: '',
        outlet: 'header',
        loadComponent: () =>
          import('../layout/header/header.component').then((m) => m.HeaderComponent),
      },
    ],
  },
  {
    path: 'home',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../features/embodiments/embodiments.component').then(
            (m) => m.EmbodimentsComponent,
          ),
      },
      {
        path: '',
        outlet: 'header',
        loadComponent: () =>
          import('../layout/header/header.component').then((m) => m.HeaderComponent),
      },
    ],
  },
  {
    path: 'profile',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../features/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: '',
        outlet: 'header',
        loadComponent: () =>
          import('../layout/header/header.component').then((m) => m.HeaderComponent),
      },
    ],
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
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../features/admin/admin.component').then((m) => m.AdminComponent),
      },
      {
        path: '',
        outlet: 'header',
        loadComponent: () =>
          import('../layout/header/header.component').then((m) => m.HeaderComponent),
      },
    ],
  },
  {
    path: 'embodiments',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../features/embodiments/embodiments.component').then(
            (m) => m.EmbodimentsComponent,
          ),
      },
      {
        path: '',
        outlet: 'header',
        loadComponent: () =>
          import('../layout/header/header.component').then((m) => m.HeaderComponent),
      },
    ],
  },
];

export const routerProvider = () => provideRouter(routes);
