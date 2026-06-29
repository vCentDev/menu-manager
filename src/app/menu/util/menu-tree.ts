import { localizeSection } from './menu-localization';
import type { LanguageCode } from '../../shared/api';
import type {
  LocalizedDish,
  OrderCriteria,
  Section,
  SectionNode,
} from './menu.model';

const ROOT_PARENT_KEY = 'root';

function sortDishes(
  dishes: LocalizedDish[],
  sortCriteria: OrderCriteria,
): LocalizedDish[] {
  return [...dishes].sort((a, b) => {
    if (sortCriteria === 'price-asc') return a.priceCents - b.priceCents;

    if (sortCriteria === 'price-desc') return b.priceCents - a.priceCents;

    return a.displayOrder - b.displayOrder;
  });
}

function sortSectionsByDisplayOrder(sections: Section[]): void {
  sections.sort((a, b) => a.displayOrder - b.displayOrder);
}

function mapDishesBySectionId(
  visibleDishes: LocalizedDish[],
): Map<string, LocalizedDish[]> {
  const dishesBySectionId = new Map<string, LocalizedDish[]>();

  for (const dish of visibleDishes) {
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
    sortSectionsByDisplayOrder(siblings);
  }

  return sectionsByParentId;
}

export function buildMenuTree(
  sections: Section[],
  visibleDishes: LocalizedDish[],
  lang: LanguageCode,
  sortCriteria: OrderCriteria,
): SectionNode[] {
  const dishesBySectionId = mapDishesBySectionId(visibleDishes);
  const sectionsByParentId = mapSectionsByParentId(sections);
  const rootSections = sectionsByParentId.get(ROOT_PARENT_KEY) ?? [];
  const result: SectionNode[] = [];

  function buildNode(section: Section): SectionNode | null {
    const localizedSection = localizeSection(section, lang);

    const dishes = sortDishes(
      dishesBySectionId.get(section.id) ?? [],
      sortCriteria,
    );

    const childSections = sectionsByParentId.get(section.id) ?? [];
    const children: SectionNode[] = [];

    for (const childSection of childSections) {
      const childNode = buildNode(childSection);
      if (childNode !== null) {
        children.push(childNode);
      }
    }

    if (dishes.length === 0 && children.length === 0) {
      return null;
    }

    return {
      section: localizedSection,
      dishes,
      children,
    };
  }

  for (const rootSection of rootSections) {
    const node = buildNode(rootSection);
    if (node !== null) {
      result.push(node);
    }
  }

  return result;
}
