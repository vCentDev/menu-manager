import type { Allergen, Dish, Section, Translation } from '@menu/util/menu.model';
import type {
  RawAllergen,
  RawDish,
  RawSection,
  RawTranslation,
} from './menu.type';

function toTranslationMap(
  rawTranslations: RawTranslation[],
): Record<string, Translation> {
  const translation: Record<string, Translation> = {};

  for (const element of rawTranslations) {
    translation[element.language_code] = {
      name: element.name,
      description: element.description ?? undefined,
    };
  }

  return translation;
}

function mapAllergen(rawAllergen: RawAllergen): Allergen {
  return {
    id: rawAllergen.id,
    code: rawAllergen.code,
    icon: rawAllergen.icon ?? undefined,
    translations: toTranslationMap(rawAllergen.allergen_translations),
  };
}

export function mapDish(raw: RawDish): Dish {
  return {
    id: raw.id,
    sectionId: raw.section_id,
    priceCents: raw.price_cents,
    isAvailable: raw.is_available,
    imageUrl: raw.image_url ?? undefined,
    displayOrder: raw.display_order,
    allergens: raw.allergens.map(mapAllergen),
    translations: toTranslationMap(raw.dish_translations),
  };
}

export function mapSection(raw: RawSection): Section {
  return {
    id: raw.id,
    parentId: raw.parent_id ?? undefined,
    slug: raw.slug,
    displayOrder: raw.display_order,
    translations: toTranslationMap(raw.section_translations),
  };
}
