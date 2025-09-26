import { provideRouter, Routes } from '@angular/router';
import { AdminGuard } from '../core/guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../features/login/login.component').then((m) => m.LoginComponent),
      },
    ],
  },
  {
    path: 'home',
    children: [
      {
        path: '',
        loadComponent: () => import('../features/home/home.component').then((m) => m.HomeComponent),
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
      {
        path: ':rivalId',
        loadComponent: () =>
          import('../features/rival/rival.component').then((m) => m.RivalComponent),
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
  {
    path: 'chat',
    children: [
      {
        path: ':receiverId',
        loadComponent: () => import('../features/chat/chat.component').then((m) => m.ChatComponent),
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
    path: 'messages',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../features/messages/messages.component').then((m) => m.MessagesComponent),
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
    path: 'sw-test',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../shared/components/service-worker-test.component').then(
            (m) => m.ServiceWorkerTestComponent,
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
    path: 'cache-test',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../shared/components/service-worker-test-enhanced.component').then(
            (m) => m.ServiceWorkerTestEnhancedComponent,
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
