import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TabsModule } from 'primeng/tabs';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { LanguageService, SupabaseService } from '@shared/api';
import { AdminStore } from '../../data/admin.store';
import { AdminFiltersComponent } from '../../ui/admin-filters/admin-filters.component';
import { AdminSectionGroupComponent } from '../../ui/admin-section-group/admin-section-group.component';

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
    ToastModule,
  ],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.css',
})
export class AdminPageComponent implements OnInit {
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);
  protected readonly adminStore = inject(AdminStore);
  protected readonly languageService = inject(LanguageService);
  private readonly translateService = inject(TranslateService);
  private readonly messageService = inject(MessageService);

  async ngOnInit(): Promise<void> {
    await this.adminStore.load();
  }

  protected async onLogout(): Promise<void> {
    try {
      await this.supabase.signOut();
    } finally {
      this.router.navigateByUrl('/login');
    }
  }

  private showSaveError(): void {
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.instant('admin.toast.saveError'),
    });
    console.log('toast');
  }

  protected async onAvailabilityChange({
    id,
    available,
  }: {
    id: string;
    available: boolean;
  }): Promise<void> {
    try {
      await this.adminStore.setDishAvailability(id, available);
    } catch {
      this.showSaveError();
    }
  }

  protected async onPriceChange({
    id,
    price,
  }: {
    id: string;
    price: number;
  }): Promise<void> {
    try {
      await this.adminStore.setDishPrice(id, price);
    } catch {
      this.showSaveError();
    }
  }
}
