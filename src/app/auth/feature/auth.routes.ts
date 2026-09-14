import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./login-page/login-page.component').then(
        (m) => m.LoginPageComponent,
      ),
  },
];

export const forbiddenRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./forbidden-page/forbidden-page.component').then(
        (m) => m.ForbiddenPageComponent,
      ),
  },
];
