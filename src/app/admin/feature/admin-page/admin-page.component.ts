import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { ButtonModule } from 'primeng/button';

import { SupabaseService } from '@shared/api';
import { AdminClient } from '../../data/admin.client';

@Component({
  selector: 'app-admin-page',
  imports: [TranslatePipe, ButtonModule],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.css',
})
export class AdminPageComponent implements OnInit {
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);
  private readonly adminClient = inject(AdminClient);

  ngOnInit(): void {
    this.adminClient.getAllergens();
  }

  protected async onLogout(): Promise<void> {
    try {
      await this.supabase.signOut();
    } finally {
      this.router.navigateByUrl('/login');
    }
  }
}
