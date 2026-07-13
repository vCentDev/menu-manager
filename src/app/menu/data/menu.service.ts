import { Injectable, computed, inject, signal } from '@angular/core';
import { LanguageService } from '@shared/api';
import { MenuClient } from './menu.client';
import { Dish, OrderCriteria, Section } from '@menu/util/menu.model';
import { localizeDish } from '@menu/util/menu-localization';
import { matchesSearch } from '@menu/util/normalize-text';
import { buildMenuTree } from '@menu/util/menu-tree';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  // Dependencies
  private readonly menuClient = inject(MenuClient);
  private readonly languageService = inject(LanguageService);

  // Data
  private readonly _dishes = signal<Dish[]>([]);
  readonly dishes = this._dishes.asReadonly();
  private readonly _sections = signal<Section[]>([]);
  readonly sections = this._sections.asReadonly();
  readonly localizedDishes = computed(() =>
    this._dishes().map((dish) =>
      localizeDish(dish, this.languageService.lang()),
    ),
  );
  readonly visibleDishes = computed(() => {
    return this.localizedDishes()
      .filter((dish) => dish.isAvailable)
      .filter(
        (dish) =>
          !dish.allergens.some((allergen) =>
            this._excludedAllergenCodes().has(allergen.code),
          ),
      )
      .filter((dish) => matchesSearch(dish, this.searchQuery()));
  });

  readonly menuTree = computed(() =>
    buildMenuTree(
      this.sections(),
      this.visibleDishes(),
      this.languageService.lang(),
      this.sortCriteria(),
    ),
  );

  // Load state
  private readonly _status = signal<'idle' | 'loading' | 'ready' | 'error'>(
    'idle',
  );
  readonly status = this._status.asReadonly();
  private readonly _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

  // Filters
  private readonly _searchQuery = signal('');
  readonly searchQuery = this._searchQuery.asReadonly();
  private readonly _excludedAllergenCodes = signal(new Set<string>());
  readonly excludedAllergenCodes = this._excludedAllergenCodes.asReadonly();
  private readonly _sortCriteria = signal<OrderCriteria>('default');
  readonly sortCriteria = this._sortCriteria.asReadonly();

  //Data Loading
  async load() {
    if (this.status() === 'loading') return;

    this._status.set('loading');
    this._error.set(null);

    try {
      const [dishes, sections] = await Promise.all([
        this.menuClient.getDishes(),
        this.menuClient.getSections(),
      ]);
      this._dishes.set(dishes);
      this._sections.set(sections);
      this._status.set('ready');
    } catch (error) {
      this._error.set('No se pudo cargar la carta');
      this._status.set('error');
    }
  }

  //Filter Methods
  setSearch(query: string): void {
    this._searchQuery.set(query);
  }

  setSort(criteria: OrderCriteria): void {
    this._sortCriteria.set(criteria);
  }

  toggleAllergen(code: string): void {
    const excludedAllergensCopy = new Set(this._excludedAllergenCodes());

    if (excludedAllergensCopy.has(code)) {
      excludedAllergensCopy.delete(code);
    } else {
      excludedAllergensCopy.add(code);
    }

    this._excludedAllergenCodes.set(excludedAllergensCopy);
  }

  clearExcludedAllergens(): void {
    this._excludedAllergenCodes.set(new Set<string>());
  }
}
