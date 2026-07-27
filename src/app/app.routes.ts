import { Routes } from '@angular/router';
import { authGuard } from '@auth/api';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('@menu/api').then((m) => m.menuRoutes),
  },
  {
    path: 'login',
    loadChildren: () => import('@auth/api').then((m) => m.authRoutes),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () => import('@admin/api').then((m) => m.adminRoutes),
  },
];
