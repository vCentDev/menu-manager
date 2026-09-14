import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { ButtonModule } from 'primeng/button';

import { SupabaseService } from '@shared/api';

@Component({
  selector: 'app-forbidden-page',
  imports: [RouterLink, TranslatePipe, ButtonModule],
  templateUrl: './forbidden-page.component.html',
  styleUrl: './forbidden-page.component.css',
})
export class ForbiddenPageComponent {
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
