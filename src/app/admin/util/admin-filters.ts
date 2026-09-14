import type {
  AdminAvailabilityFilter,
  AdminDishRow,
  AdminSortCriteria,
} from './admin.model';

function normalizeForSearch(text: string): string {
  return text.trim().normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

export function matchesAdminSearch(row: AdminDishRow, query: string): boolean {
  const normalizedQuery = normalizeForSearch(query);

  if (!normalizedQuery) return true;

  const normalizedName = normalizeForSearch(row.name);

  return normalizedName.includes(normalizedQuery);
}

export function matchesAvailability(
  row: AdminDishRow,
  filter: AdminAvailabilityFilter,
): boolean {
  if (filter === 'all') return true;

  return filter === 'available' ? row.isAvailable : !row.isAvailable;
}

export function sortAdminRows(
  rows: AdminDishRow[],
  criteria: AdminSortCriteria,
): AdminDishRow[] {
  return [...rows].sort((a, b) => {
    if (criteria === 'price-asc') return a.priceCents - b.priceCents;

    if (criteria === 'price-desc') return b.priceCents - a.priceCents;

    if (criteria === 'name-asc')
      return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });

    if (criteria === 'name-desc')
      return b.name.localeCompare(a.name, 'es', { sensitivity: 'base' });

    return a.displayOrder - b.displayOrder;
  });
}
