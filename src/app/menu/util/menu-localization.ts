import { LanguageCode } from '../../shared/api';
import {
  Dish,
  LocalizedDish,
  LocalizedSection,
  Section,
  Translation,
} from './menu.model';

function resolveTranslation(
  map: Record<string, Translation>,
  lang: LanguageCode,
): Translation {
  const fallbackLang = lang === 'es' ? 'en' : 'es';

  if (map[lang]) return map[lang];

  if (map[fallbackLang]) return map[fallbackLang];

  return { name: '', description: undefined };
}

export function localizeDish(dish: Dish, lang: LanguageCode): LocalizedDish {
  const translation = resolveTranslation(dish.translations, lang);
  return {
    id: dish.id,
    sectionId: dish.sectionId,
    name: translation.name,
    description: translation.description,
    priceCents: dish.priceCents,
    isAvailable: dish.isAvailable,
    displayOrder: dish.displayOrder,
    imageUrl: dish.imageUrl,
    allergens: dish.allergens,
  };
}

export function localizeSection(
  section: Section,
  lang: LanguageCode,
): LocalizedSection {
  const translation = resolveTranslation(section.translations, lang);
  return {
    id: section.id,
    name: translation.name,
    slug: section.slug,
  };
}
