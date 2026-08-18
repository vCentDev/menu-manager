import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TabsModule } from 'primeng/tabs';

import { LanguageService, SupabaseService } from '@shared/api';
import { AdminService } from '@admin/data/admin.service';
import { AdminFiltersComponent } from '@admin/ui/admin-filters/admin-filters.component';
import { AdminSectionGroupComponent } from '@admin/ui/admin-section-group/admin-section-group.component';

@Component({
  selector: 'app-admin-page',
  imports: [
    TranslatePipe,
    ButtonModule,
    MessageModule,
    ProgressSpinnerModule,
    TabsModule,
    AdminFiltersComponent,
    AdminSectionGroupComponent,
  ],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.css',
})
export class AdminPageComponent implements OnInit {
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);
  protected readonly adminService = inject(AdminService);
  protected readonly languageService = inject(LanguageService);

  async ngOnInit(): Promise<void> {
    await this.adminService.load();
  }

  protected async onLogout(): Promise<void> {
    try {
      await this.supabase.signOut();
    } finally {
      this.router.navigateByUrl('/login');
    }
  }
}
