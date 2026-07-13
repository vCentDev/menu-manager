import { Routes } from '@angular/router';

export const menuRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@menu/feature/menu-page/menu-page.component').then(
        (m) => m.MenuPageComponent,
      ),
  },
];
