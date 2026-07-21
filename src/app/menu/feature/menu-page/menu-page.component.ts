import { Component, inject, OnInit, signal } from '@angular/core';

import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';

import { MenuService } from '@menu/data/menu.service';
import { LanguageService } from '@app/shared/api';
import { MenuSectionComponent } from '@app/menu/ui/menu-section/menu-section.component';
import { MenuFiltersComponent } from '@app/menu/ui/menu-filters/menu-filters.component';

@Component({
  selector: 'app-menu-page',
  imports: [
    ProgressSpinnerModule,
    MessageModule,
    ButtonModule,
    MenuSectionComponent,
    MenuFiltersComponent,
  ],
  templateUrl: './menu-page.component.html',
  styleUrl: './menu-page.component.css',
})
export class MenuPageComponent implements OnInit {
  protected readonly menuService = inject(MenuService);
  protected readonly langService = inject(LanguageService);

  protected readonly title = signal('Menú Casa Mateu');

  async ngOnInit(): Promise<void> {
    await this.menuService.load();
  }
}
