export interface Translation {
  name: string;
  description?: string;
}

export interface Allergen {
  id: string;
  code: string;
  icon?: string;
  translations: Record<string, Translation>;
}

export interface Dish {
  id: string;
  sectionId: string;
  priceCents: number;
  isAvailable: boolean;
  imageUrl?: string;
  displayOrder: number;
  allergens: Allergen[];
  translations: Record<string, Translation>;
}

export interface Section {
  id: string;
  parentId?: string;
  slug: string;
  displayOrder: number;
  translations: Record<string, Translation>;
}
