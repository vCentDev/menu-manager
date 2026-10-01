import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./login-page/login-page').then(
        (m) => m.LoginPage,
      ),
  },
];

export const forbiddenRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./forbidden-page/forbidden-page').then(
        (m) => m.ForbiddenPage,
      ),
  },
];
