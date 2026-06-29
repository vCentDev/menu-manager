import type { LocalizedDish } from './menu.model';

function normalizeForSearch(text: string): string {
  return text.trim().normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

export function matchesSearch(dish: LocalizedDish, query: string): boolean {
  const normalizedQuery = normalizeForSearch(query);

  if (!normalizedQuery) return true;

  const normalizedName = normalizeForSearch(dish.name);
  const normalizedDescription = dish.description
    ? normalizeForSearch(dish.description)
    : '';

  return (
    normalizedName.includes(normalizedQuery) ||
    normalizedDescription.includes(normalizedQuery)
  );
}
