import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ToastService } from '../../../../shared/toast.service';
import { ViewportService } from '../../../../shared/viewport.service';
import { CATEGORY_LABEL, ClothingCategory, ClothingItem } from '../../models/clothing.model';
import { ClothingService } from '../../services/clothing.service';

type CategoryFilter = ClothingCategory | 'all';

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  styleUrl: './catalog-page.component.scss',
  imports: [FormsModule, RouterLink, MatPaginatorModule],
  template: `
    <div class="container page">
      <section class="hero card">
        <div>
          <p class="eyebrow">Catálogo</p>
          <h1>Todas tus prendas</h1>
          <p class="muted">Filtra por categoría, marca, color y estilo.</p>
        </div>
      </section>

      <section class="filters card">
        <div class="category-filters" aria-label="Filtrar por categoría">
          @for (option of categoryOptions; track option.value) {
            <button
              class="category-chip"
              type="button"
              [class.selected]="categoryFilter() === option.value"
              [attr.aria-pressed]="categoryFilter() === option.value"
              (click)="setCategoryFilter(option.value)"
            >
              {{ option.label }}
            </button>
          }
        </div>

        <div class="select-filters">
          <label>
            Marca
            <select [ngModel]="brandFilter()" (ngModelChange)="setBrandFilter($event)">
              <option value="all">Todas</option>
              @for (brand of brands(); track brand) {
                <option [value]="brand">{{ brand }}</option>
              }
            </select>
          </label>

          <label>
            Color
            <select [ngModel]="colorFilter()" (ngModelChange)="setColorFilter($event)">
              <option value="all">Todos</option>
              @for (color of colors(); track color) {
                <option [value]="color">{{ color }}</option>
              }
            </select>
          </label>

          <label>
            Estilo
            <select [ngModel]="styleFilter()" (ngModelChange)="setStyleFilter($event)">
              <option value="all">Todos</option>
              @for (style of styles(); track style) {
                <option [value]="style">{{ style }}</option>
              }
            </select>
          </label>
        </div>
      </section>

      @if (clothingService.loading()) {
        <p class="status-text">Cargando catálogo...</p>
      }

      @if (clothingService.error()) {
        <p class="error-text">{{ clothingService.error() }}</p>
      }

      @if (!filteredItems().length && !clothingService.loading()) {
        <section class="empty-state card big">
          <h2>No hay prendas con estos filtros</h2>
          <p>Prueba con otra combinación de categoría, marca, color o estilo.</p>
        </section>
      }

      <section class="catalog-grid">
        @for (item of visibleItems(); track item.id) {
          <article class="catalog-card card">
            <div class="card-actions">
              <a class="edit-btn" [routerLink]="['/upload', item.id]">Editar</a>
              <button class="delete-btn" type="button" (click)="deleteItem(item)">Eliminar</button>
            </div>

            <div class="image-shell">
              <img [src]="item.image_url" [alt]="item.name" />
            </div>

            <div class="item-info">
              <h3>{{ item.name }}</h3>
              <p class="muted">{{ labels[item.category] }}</p>

              <div class="tags">
                @if (item.brand) {
                  <span>{{ item.brand }}</span>
                }
                @if (item.color) {
                  <span>{{ item.color }}</span>
                }
                @if (item.style) {
                  <span>{{ item.style }}</span>
                }
              </div>
            </div>
          </article>
        }
      </section>

      @if (isGridMode() && filteredItems().length) {
        <mat-paginator
          [length]="filteredItems().length"
          [pageSize]="pageSize()"
          [pageIndex]="clampedPageIndex()"
          [pageSizeOptions]="[8, 12, 24]"
          (page)="onPageChange($event)"
          aria-label="Selecciona página del catálogo"
        />
      }
    </div>
  `,
})
export class CatalogPageComponent implements OnInit {
  readonly clothingService = inject(ClothingService);
  private readonly toast = inject(ToastService);
  private readonly viewport = inject(ViewportService);
  readonly isGridMode = this.viewport.isGridMode;
  readonly labels = CATEGORY_LABEL;

  readonly categoryOptions: { value: CategoryFilter; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 'top', label: CATEGORY_LABEL.top },
    { value: 'bottom', label: CATEGORY_LABEL.bottom },
    { value: 'shoes', label: CATEGORY_LABEL.shoes },
  ];

  readonly categoryFilter = signal<CategoryFilter>('all');
  readonly brandFilter = signal('all');
  readonly colorFilter = signal('all');
  readonly styleFilter = signal('all');

  private readonly items = this.clothingService.clothingItems;

  readonly brands = computed(() => this.uniqueValues(this.items().map((item) => item.brand)));
  readonly colors = computed(() => this.uniqueValues(this.items().map((item) => item.color)));
  readonly styles = computed(() =>
    this.uniqueValues(
      this.items().flatMap((item) => (item.style ?? '').split(',').map((style) => style.trim())),
    ),
  );

  readonly filteredItems = computed(() => {
    const category = this.categoryFilter();
    const brand = this.brandFilter();
    const color = this.colorFilter();
    const style = this.styleFilter();

    return this.items().filter((item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (brand !== 'all' && item.brand !== brand) return false;
      if (color !== 'all' && item.color !== color) return false;

      if (style !== 'all') {
        const itemStyles = (item.style ?? '').split(',').map((s) => s.trim());
        if (!itemStyles.includes(style)) return false;
      }

      return true;
    });
  });

  readonly pageSize = signal(12);
  readonly pageIndex = signal(0);

  private readonly maxPageIndex = computed(() =>
    Math.max(0, Math.ceil(this.filteredItems().length / this.pageSize()) - 1),
  );
  readonly clampedPageIndex = computed(() => Math.min(this.pageIndex(), this.maxPageIndex()));

  private readonly pagedItems = computed(() => {
    const start = this.clampedPageIndex() * this.pageSize();
    return this.filteredItems().slice(start, start + this.pageSize());
  });

  readonly visibleItems = computed(() => (this.isGridMode() ? this.pagedItems() : this.filteredItems()));

  setCategoryFilter(value: CategoryFilter): void {
    this.categoryFilter.set(value);
    this.pageIndex.set(0);
  }

  setBrandFilter(value: string): void {
    this.brandFilter.set(value);
    this.pageIndex.set(0);
  }

  setColorFilter(value: string): void {
    this.colorFilter.set(value);
    this.pageIndex.set(0);
  }

  setStyleFilter(value: string): void {
    this.styleFilter.set(value);
    this.pageIndex.set(0);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  async ngOnInit(): Promise<void> {
    await this.clothingService.loadClothingItems();
  }

  async deleteItem(item: ClothingItem): Promise<void> {
    try {
      await this.clothingService.deleteClothingItem(item);
      this.toast.success('Prenda eliminada correctamente');
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'No se pudo eliminar la prenda.');
    }
  }

  private uniqueValues(values: (string | null | undefined)[]): string[] {
    return [...new Set(values.filter((value): value is string => !!value))].sort((a, b) =>
      a.localeCompare(b),
    );
  }
}
