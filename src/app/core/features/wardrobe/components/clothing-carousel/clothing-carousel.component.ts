import { Component, EventEmitter, Input, OnChanges, Output, signal } from '@angular/core';
import { ClothingItem } from '../../models/clothing.model';

@Component({
  selector: 'app-clothing-carousel',
  styleUrl: './clothing-carousel.component.scss',
  standalone: true,
  template: `
    <section class="carousel">
      <div class="section-header compact">
        <div>
          <p class="eyebrow">Categoría</p>
          <h2>{{ title }}</h2>
        </div>

        @if (items.length) {
          <span class="counter">{{ selectedIndex() + 1 }} / {{ items.length }}</span>
        }
      </div>

      @if (selectedItem; as item) {
        <div class="carousel-body">
          <button class="arrow" type="button" aria-label="Anterior" (click)="previous()">‹</button>

          <article class="clothing-item">
            <div class="image-shell">
              <img [src]="item.image_url" [alt]="item.name" />
            </div>

            <div class="item-info">
              <h3>{{ item.name }}</h3>

              <div class="tags">
                @if (item.color) {
                  <span>{{ item.color }}</span>
                }
                @if (item.style) {
                  <span>{{ item.style }}</span>
                }
              </div>
            </div>
          </article>

          <button class="arrow" type="button" aria-label="Siguiente" (click)="next()">›</button>
        </div>
      } @else {
        <div class="empty-state">
          <p>{{ emptyMessage }}</p>
        </div>
      }
    </section>
  `,
})
export class ClothingCarouselComponent implements OnChanges {
  @Input({ required: true }) title = '';
  @Input() emptyMessage = 'Todavía no hay prendas en esta categoría.';
  @Input() items: ClothingItem[] = [];

  @Output() selectedChange = new EventEmitter<ClothingItem | null>();

  selectedIndex = signal(0);

  get selectedItem(): ClothingItem | null {
    return this.items[this.selectedIndex()] ?? null;
  }

  ngOnChanges(): void {
    if (!this.items.length) {
      this.selectedIndex.set(0);
      this.selectedChange.emit(null);
      return;
    }

    if (this.selectedIndex() > this.items.length - 1) {
      this.selectedIndex.set(0);
    }

    this.emitSelected();
  }

  previous(): void {
    const total = this.items.length;
    if (!total) return;

    this.selectedIndex.update((current) => (current - 1 + total) % total);
    this.emitSelected();
  }

  next(): void {
    const total = this.items.length;
    if (!total) return;

    this.selectedIndex.update((current) => (current + 1) % total);
    this.emitSelected();
  }

  private emitSelected(): void {
    this.selectedChange.emit(this.selectedItem);
  }
}
