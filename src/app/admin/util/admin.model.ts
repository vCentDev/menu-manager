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

export interface AdminSectionNode {
  id: string;
  name: string;
  displayOrder: number;
  dishes: AdminDishRow[];
  children: AdminSectionNode[];
}

export type AdminSortCriteria =
  | 'default'
  | 'price-asc'
  | 'price-desc'
  | 'name-asc'
  | 'name-desc';

export type AdminAvailabilityFilter = 'all' | 'available' | 'unavailable';
