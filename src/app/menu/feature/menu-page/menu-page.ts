import { Component, inject, OnInit, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';

import { MenuStore } from '@menu/data/menu.store';
import { LanguageService } from '@app/shared/api';
import { MenuSection } from '@app/menu/ui/menu-section/menu-section';
import { MenuFilters } from '@app/menu/ui/menu-filters/menu-filters';

@Component({
  selector: 'app-menu-page',
  imports: [
    ProgressSpinnerModule,
    MessageModule,
    ButtonModule,
    MenuSection,
    MenuFilters,
    TranslatePipe,
  ],
  templateUrl: './menu-page.html',
  styleUrl: './menu-page.css',
})
export class MenuPage implements OnInit {
  protected readonly menuStore = inject(MenuStore);
  protected readonly langService = inject(LanguageService);

  protected readonly title = signal('Menú Casa Mateu');

  async ngOnInit(): Promise<void> {
    await this.menuStore.load();
  }
}
