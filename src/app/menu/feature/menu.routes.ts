import { Routes } from '@angular/router';

export const menuRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@menu/feature/menu-page/menu-page').then(
        (m) => m.MenuPage,
      ),
  },
];
