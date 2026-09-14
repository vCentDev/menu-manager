import { Routes } from '@angular/router';
import { AdminStore } from '@admin/data/admin.store';
import { MessageService } from 'primeng/api';

export const adminRoutes: Routes = [
  {
    path: '',
    providers: [AdminStore, MessageService],
    loadComponent: () =>
      import('./admin-page/admin-page.component').then(
        (m) => m.AdminPageComponent,
      ),
  },
];
