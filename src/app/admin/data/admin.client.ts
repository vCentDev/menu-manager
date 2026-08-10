import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '@shared/api';

import { mapAllergen, mapDish, mapSection } from './admin.mapper';
import type { RawAllergen, RawDish, RawSection } from './admin.type';
import type { Allergen, Dish, Section } from '@menu/api';

const DISH_SELECT =
  'id, section_id, price_cents, is_available, image_url, display_order, dish_translations(language_code, name, description), allergens(id, code, icon, allergen_translations(language_code, name))';
const SECTION_SELECT =
  'id, parent_id, slug, display_order, section_translations(language_code, name)';
const ALLERGEN_SELECT =
  'id, code, icon, allergen_translations(language_code, name)';

@Injectable({ providedIn: 'root' })
export class AdminClient {
  private readonly db = inject(SupabaseService);

  async getDishes(): Promise<Dish[]> {
    const { data, error } = await this.db.supabase
      .from('dishes')
      .select(DISH_SELECT)
      .order('display_order');

    if (error) throw error;

    const rawDishes = data ?? ([] as RawDish[]);
    const dishes = rawDishes.map(mapDish);

    return dishes;
  }

  async getSections(): Promise<Section[]> {
    const { data, error } = await this.db.supabase
      .from('sections')
      .select(SECTION_SELECT)
      .order('display_order');

    if (error) throw error;

    const rawSections = data ?? ([] as RawSection[]);
    const sections = rawSections.map(mapSection);

    return sections;
  }

  async getAllergens(): Promise<Allergen[]> {
    const { data, error } = await this.db.supabase
      .from('allergens')
      .select(ALLERGEN_SELECT)
      .order('code');

    if (error) throw error;

    const rawAllergens = data ?? ([] as RawAllergen[]);
    const allergens = rawAllergens.map(mapAllergen);

    return allergens;
  }
}
