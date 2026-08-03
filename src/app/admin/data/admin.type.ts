export interface RawTranslation {
  language_code: string;
  name: string;
  description?: string | null;
}

export interface RawAllergen {
  id: string;
  code: string;
  icon?: string | null;
  allergen_translations: RawTranslation[];
}

export interface RawDish {
  id: string;
  section_id: string;
  price_cents: number;
  is_available: boolean;
  image_url?: string | null;
  display_order: number;
  dish_translations: RawTranslation[];
  allergens: RawAllergen[];
}

export interface RawSection {
  id: string;
  parent_id?: string | null;
  slug: string;
  display_order: number;
  section_translations: RawTranslation[];
}
