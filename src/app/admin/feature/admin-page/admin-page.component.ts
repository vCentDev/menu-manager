import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { ButtonModule } from 'primeng/button';

import { SupabaseService } from '@shared/api';
import { AdminService } from '@admin/data/admin.service';

@Component({
  selector: 'app-admin-page',
  imports: [TranslatePipe, ButtonModule],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.css',
})
export class AdminPageComponent implements OnInit {
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);
  protected readonly adminService = inject(AdminService);

  ngOnInit(): void {
    this.adminService.load();
  }

  protected async onLogout(): Promise<void> {
    try {
      await this.supabase.signOut();
    } finally {
      this.router.navigateByUrl('/login');
    }
  }
}
