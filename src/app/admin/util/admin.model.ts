import { LanguageCode } from '@shared/api';

export interface AdminDishRow {
  id: string;
  sectionId: string;
  name: string;
  priceCents: number;
  isAvailable: boolean;
  displayOrder: number;
  missingLanguages: LanguageCode[];
}
