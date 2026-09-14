import type { Section } from '@menu/api';
import { AdminDishRow, AdminSectionNode } from './admin.model';
import { resolveAdminName } from './admin-translation';

const ROOT_PARENT_KEY = 'root';

function mapDishesBySectionId(
  dishRows: AdminDishRow[],
): Map<string, AdminDishRow[]> {
  const dishesBySectionId = new Map<string, AdminDishRow[]>();

  for (const dish of dishRows) {
    const dishes = dishesBySectionId.get(dish.sectionId) ?? [];
    dishes.push(dish);
    dishesBySectionId.set(dish.sectionId, dishes);
  }

  return dishesBySectionId;
}

function mapSectionsByParentId(sections: Section[]): Map<string, Section[]> {
  const sectionsByParentId = new Map<string, Section[]>();

  for (const section of sections) {
    const parentKey = section.parentId ?? ROOT_PARENT_KEY;
    const siblings = sectionsByParentId.get(parentKey) ?? [];
    siblings.push(section);
    sectionsByParentId.set(parentKey, siblings);
  }

  for (const siblings of sectionsByParentId.values()) {
    siblings.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  return sectionsByParentId;
}

export function buildAdminTree(
  sections: Section[],
  rows: AdminDishRow[],
): AdminSectionNode[] {
  const dishesBySectionId = mapDishesBySectionId(rows);
  const sectionsByParentId = mapSectionsByParentId(sections);
  const rootSections = sectionsByParentId.get(ROOT_PARENT_KEY) ?? [];
  const result: AdminSectionNode[] = [];

  function buildNode(section: Section): AdminSectionNode {
    const dishes = dishesBySectionId.get(section.id) ?? [];
    const childSections = sectionsByParentId.get(section.id) ?? [];

    const children: AdminSectionNode[] = [];
    for (const child of childSections) {
      children.push(buildNode(child));
    }

    return {
      id: section.id,
      name: resolveAdminName(section.translations),
      displayOrder: section.displayOrder,
      dishes,
      children,
    };
  }

  for (const root of rootSections) {
    result.push(buildNode(root));
  }

  return result;
}
