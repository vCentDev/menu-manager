import { computed, inject, Injectable, signal } from '@angular/core';

import type { Allergen, Dish, Section } from '@menu/api';
import { AdminClient } from './admin.client';
import { buildAdminTree } from '../util/admin-tree';
import { eurosToCents } from '../util/price';
import {
  matchesAdminSearch,
  matchesAvailability,
  sortAdminRows,
} from '../util/admin-filters';
import {
  AdminAvailabilityFilter,
  AdminSortCriteria,
  type AdminDishRow,
} from '../util/admin.model';
import {
  findMissingLanguages,
  resolveAdminName,
} from '../util/admin-translation';

@Injectable()
export class AdminStore {
  // Dependencies
  private readonly adminClient = inject(AdminClient);

  // Data
  private readonly _dishes = signal<Dish[]>([]);
  readonly dishes = this._dishes.asReadonly();
  private readonly _sections = signal<Section[]>([]);
  readonly sections = this._sections.asReadonly();
  private readonly _allergens = signal<Allergen[]>([]);
  readonly allergens = this._allergens.asReadonly();

  readonly dishRows = computed<AdminDishRow[]>(() => {
    return this.dishes().map((dish) => ({
      id: dish.id,
      sectionId: dish.sectionId,
      name: resolveAdminName(dish.translations),
      priceCents: dish.priceCents,
      isAvailable: dish.isAvailable,
      displayOrder: dish.displayOrder,
      missingLanguages: findMissingLanguages(dish.translations),
    }));
  });

  readonly filteredRows = computed(() => {
    const rows = this.dishRows()
      .filter((row) => matchesAdminSearch(row, this.searchQuery()))
      .filter((row) => matchesAvailability(row, this.dishAvailability()));

    return sortAdminRows(rows, this.sortCriteria());
  });

  readonly groupedSections = computed(() =>
    buildAdminTree(this.sections(), this.filteredRows()),
  );

  // Load state
  private readonly _status = signal<'idle' | 'loading' | 'ready' | 'error'>(
    'idle',
  );
  readonly status = this._status.asReadonly();
  private readonly _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

  async load() {
    if (this.status() === 'loading') return;

    this._status.set('loading');
    this._error.set(null);

    try {
      const [dishes, sections, allergens] = await Promise.all([
        this.adminClient.getDishes(),
        this.adminClient.getSections(),
        this.adminClient.getAllergens(),
      ]);
      this._dishes.set(dishes);
      this._sections.set(sections);
      this._allergens.set(allergens);
      this._status.set('ready');
    } catch (error) {
      this._error.set('No se pudo cargar el panel');
      this._status.set('error');
    }
  }

  private replaceDish(updated: Dish): void {
    this._dishes.update((dishes) =>
      dishes.map((dish) => (dish.id === updated.id ? updated : dish)),
    );
  }

  async setDishAvailability(
    dishId: string,
    isAvailable: boolean,
  ): Promise<void> {
    const currentDish = this.dishes().find((dish) => dish.id === dishId);
    if (!currentDish || currentDish.isAvailable === isAvailable) return;

    this.replaceDish({ ...currentDish, isAvailable });

    try {
      await this.adminClient.updateAvailability(dishId, isAvailable);
    } catch (error) {
      const latest = this.dishes().find((dish) => dish.id === dishId);
      if (latest) {
        this.replaceDish({ ...latest, isAvailable: currentDish.isAvailable });
      }
      throw error;
    }
  }

  async setDishPrice(dishId: string, euros: number): Promise<void> {
    const currentDish = this.dishes().find((dish) => dish.id === dishId);
    const cents = eurosToCents(euros);

    if (!currentDish || currentDish.priceCents === cents) return;

    this.replaceDish({ ...currentDish, priceCents: cents });

    try {
      await this.adminClient.updatePrice(dishId, cents);
    } catch (error) {
      const latest = this.dishes().find((dish) => dish.id === dishId);
      if (latest) {
        this.replaceDish({ ...latest, priceCents: currentDish.priceCents });
      }
      throw error;
    }
  }

  // Filters
  private readonly _searchQuery = signal('');
  readonly searchQuery = this._searchQuery.asReadonly();
  private readonly _sortCriteria = signal<AdminSortCriteria>('default');
  readonly sortCriteria = this._sortCriteria.asReadonly();
  private readonly _dishAvailability = signal<AdminAvailabilityFilter>('all');
  readonly dishAvailability = this._dishAvailability.asReadonly();

  // Filters Methods
  setSearch(query: string): void {
    this._searchQuery.set(query);
  }

  setSort(criteria: AdminSortCriteria): void {
    this._sortCriteria.set(criteria);
  }

  setAvailabilityFilter(availability: AdminAvailabilityFilter): void {
    this._dishAvailability.set(availability);
  }
}
