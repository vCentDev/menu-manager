import { Translation } from '@menu/api';
import { LanguageCode } from '@shared/api';

const EDITABLE_LANGUAGES: LanguageCode[] = ['es', 'en'];

export function resolveAdminName(
  translations: Record<string, Translation>,
): string {
  const esName = translations['es']?.name?.trim();
  if (esName) return esName;

  const enName = translations['en']?.name?.trim();
  if (enName) return enName;

  return '';
}

export function findMissingLanguages(
  translations: Record<string, Translation>,
): LanguageCode[] {
  return EDITABLE_LANGUAGES.filter(
    (language) => !translations[language]?.name?.trim(),
  );
}
