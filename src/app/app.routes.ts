import { Routes } from '@angular/router';
import { adminGuard, authGuard } from '@auth/api';

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
    path: 'forbidden',
    loadChildren: () => import('@auth/api').then((m) => m.forbiddenRoutes),
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadChildren: () => import('@admin/api').then((m) => m.adminRoutes),
  },
];
