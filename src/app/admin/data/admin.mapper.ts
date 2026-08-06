import type { Allergen, Dish, Section, Translation } from '@menu/api';
import type {
  RawAllergen,
  RawDish,
  RawSection,
  RawTranslation,
} from './admin.type';

function toTranslationMap(
  rawTranslations: RawTranslation[],
): Record<string, Translation> {
  const translations: Record<string, Translation> = {};

  for (const element of rawTranslations) {
    const languageCode = element.language_code;
    const name = element.name;
    const description = element.description ?? undefined;

    translations[languageCode] = { name, description };
  }

  return translations;
}

export function mapAllergen(rawAllergen: RawAllergen): Allergen {
  return {
    id: rawAllergen.id,
    code: rawAllergen.code,
    icon: rawAllergen.icon ?? undefined,
    translations: toTranslationMap(rawAllergen.allergen_translations),
  };
}

export function mapDish(rawDish: RawDish): Dish {
  return {
    id: rawDish.id,
    sectionId: rawDish.section_id,
    priceCents: rawDish.price_cents,
    isAvailable: rawDish.is_available,
    imageUrl: rawDish.image_url ?? undefined,
    displayOrder: rawDish.display_order,
    translations: toTranslationMap(rawDish.dish_translations),
    allergens: rawDish.allergens.map(mapAllergen),
  };
}

export function mapSection(rawSection: RawSection): Section {
  return {
    id: rawSection.id,
    parentId: rawSection.parent_id ?? undefined,
    slug: rawSection.slug,
    displayOrder: rawSection.display_order,
    translations: toTranslationMap(rawSection.section_translations),
  };
}
