import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./admin-page/admin-page.component').then(
        (m) => m.AdminPageComponent,
      ),
  },
];
