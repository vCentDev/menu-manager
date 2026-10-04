import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ChipModule } from 'primeng/chip';
import { LocalizedSection } from '@menu/util/menu.model';

@Component({
  selector: 'app-menu-anchors',
  imports: [ChipModule],
  templateUrl: './menu-anchors.html',
  styleUrl: './menu-anchors.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:scroll)': 'updateActive()',
    '(window:resize)': 'updateActive()',
  },
})
export class MenuAnchors {
  readonly sections = input.required<LocalizedSection[]>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly nav = viewChild<ElementRef<HTMLElement>>('nav');
  protected readonly activeSlug = signal<string | null>(null);

  constructor() {
    // Recalcula cuando cambian las secciones (filtros, idioma), una vez pintado el DOM
    afterRenderEffect(() => {
      this.sections();
      this.updateActive();
    });

    afterRenderEffect(() => {
      this.centerActiveChip();
    });
  }

  protected updateActive(): void {
    const barBottom = this.host.nativeElement.offsetHeight;
    const viewportBottom = window.innerHeight;
    let passed: string | null = null;

    for (const section of this.sections()) {
      const title = document
        .getElementById(section.slug)
        ?.querySelector(':scope > h2');
      if (!title) continue;

      const rect = title.getBoundingClientRect();

      // El título ya pasó por debajo de la banda: seguimos en esa sección
      // hasta que aparezca el siguiente.
      if (rect.bottom <= barBottom) {
        passed = section.slug;
        continue;
      }

      // Primer título que todavía se ve: es el más alto de la pantalla.
      if (rect.top < viewportBottom) {
        this.activeSlug.set(section.slug);
        return;
      }

      break;
    }

    this.activeSlug.set(passed);
  }

  private centerActiveChip(): void {
    const slug = this.activeSlug();
    const nav = this.nav()?.nativeElement;
    if (!slug || !nav) return;

    const link = nav.querySelector<HTMLAnchorElement>(
      `a[href="#${CSS.escape(slug)}"]`,
    );
    if (!link) return;

    const maxLeft = nav.scrollWidth - nav.clientWidth;
    if (maxLeft <= 0) return;

    const navRect = nav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const delta =
      linkRect.left - navRect.left - (navRect.width - linkRect.width) / 2;
    const left = Math.min(Math.max(nav.scrollLeft + delta, 0), maxLeft);
    if (Math.abs(nav.scrollLeft - left) < 2) return;

    nav.scrollTo({
      left,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });
  }
}
