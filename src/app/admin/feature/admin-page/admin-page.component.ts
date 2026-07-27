import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { ButtonModule } from 'primeng/button';

import { SupabaseService } from '@shared/api';

@Component({
  selector: 'app-admin-page',
  imports: [TranslatePipe, ButtonModule],
  templateUrl: './admin-page.component.html',
})
export class AdminPageComponent {
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);

  protected async onLogout(): Promise<void> {
    try {
      await this.supabase.signOut();
    } finally {
      this.router.navigateByUrl('/login');
    }
  }
}
