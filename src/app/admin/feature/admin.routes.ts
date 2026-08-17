import { Routes } from '@angular/router';
import { AdminService } from '@admin/data/admin.service';

export const adminRoutes: Routes = [
  {
    path: '',
    providers: [AdminService],
    loadComponent: () =>
      import('./admin-page/admin-page.component').then(
        (m) => m.AdminPageComponent,
      ),
  },
];
