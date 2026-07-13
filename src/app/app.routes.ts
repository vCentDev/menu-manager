import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('@menu/api').then((m) => m.menuRoutes),
  },
];
