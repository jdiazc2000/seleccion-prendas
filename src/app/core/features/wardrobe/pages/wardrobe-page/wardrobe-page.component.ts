import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ClothingCarouselComponent } from '../../components/clothing-carousel/clothing-carousel.component';
import { OutfitPreviewComponent } from '../../components/outfit-preview/outfit-preview.component';
import { ClothingService } from '../../services/clothing.service';
import { OutfitService } from '../../services/outfit.service';
import { ClothingItem } from '../../models/clothing.model';

@Component({
  selector: 'app-wardrobe-page',
  standalone: true,
  styleUrl: './wardrobe-page.component.scss',
  imports: [FormsModule, RouterLink, ClothingCarouselComponent, OutfitPreviewComponent],
  template: `
    <div class="container page">
      <section class="hero card">
        <div>
          <p class="eyebrow">Closet digital</p>
          <h1>Arma combinaciones con tus prendas</h1>
          <p class="muted">Mueve cada carrusel y guarda los outfits que más te gusten.</p>
        </div>

        <a class="btn btn-primary" routerLink="/upload">Subir prenda</a>
      </section>

      @if (clothingService.loading()) {
        <p class="status-text">Cargando prendas...</p>
      }

      @if (clothingService.error()) {
        <p class="error-text">{{ clothingService.error() }}</p>
      }

      <section class="wardrobe-layout">
        <div class="carousel-list card">
          <app-clothing-carousel
            title="Parte superior"
            emptyMessage="Sube blusas, tops, polos o camisas."
            [items]="tops()"
            (selectedChange)="topSelected.set($event)"
          />

          <app-clothing-carousel
            title="Parte inferior"
            emptyMessage="Sube jeans, pantalones, faldas o shorts."
            [items]="bottoms()"
            (selectedChange)="bottomSelected.set($event)"
          />

          <app-clothing-carousel
            title="Zapatos"
            emptyMessage="Sube zapatillas, tacos, botas o sandalias."
            [items]="shoes()"
            (selectedChange)="shoesSelected.set($event)"
          />
        </div>

        <div class="side-panel">
          <app-outfit-preview
            [top]="topSelected()"
            [bottom]="bottomSelected()"
            [shoes]="shoesSelected()"
          />

          <div class="actions card">
            <input
              class="outfit-name"
              type="text"
              name="outfitName"
              placeholder="Nombre opcional del outfit"
              [(ngModel)]="outfitName"
            />

            <button
              class="btn btn-primary full"
              type="button"
              [disabled]="!canSave() || outfitService.loading()"
              (click)="saveFavorite()"
            >
              {{ outfitService.loading() ? 'Guardando...' : 'Guardar outfit' }}
            </button>

            <a class="btn btn-secondary full" routerLink="/favorites">Ver favoritos</a>

            @if (message()) {
              <p class="success-text">{{ message() }}</p>
            }

            @if (outfitService.error()) {
              <p class="error-text">{{ outfitService.error() }}</p>
            }
          </div>
        </div>
      </section>
    </div>
  `,
})
export class WardrobePageComponent implements OnInit {
  readonly clothingService = inject(ClothingService);
  readonly outfitService = inject(OutfitService);

  readonly topSelected = signal<ClothingItem | null>(null);
  readonly bottomSelected = signal<ClothingItem | null>(null);
  readonly shoesSelected = signal<ClothingItem | null>(null);

  readonly tops = computed(() => this.clothingService.getByCategory('top'));
  readonly bottoms = computed(() => this.clothingService.getByCategory('bottom'));
  readonly shoes = computed(() => this.clothingService.getByCategory('shoes'));

  readonly canSave = computed(() =>
    Boolean(this.topSelected() && this.bottomSelected() && this.shoesSelected()),
  );

  readonly message = signal<string | null>(null);
  outfitName = '';

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.clothingService.loadClothingItems(),
      this.outfitService.loadOutfits(),
    ]);
  }

  async saveFavorite(): Promise<void> {
    const top = this.topSelected();
    const bottom = this.bottomSelected();
    const shoes = this.shoesSelected();

    if (!top || !bottom || !shoes) {
      this.message.set('Selecciona una prenda de cada categoría.');
      return;
    }

    this.message.set(null);

    await this.outfitService.createOutfit({
      name: this.outfitName.trim() || undefined,
      top_id: top.id,
      bottom_id: bottom.id,
      shoes_id: shoes.id,
    });

    this.outfitName = '';
    this.message.set('Outfit guardado en favoritos ♡');
  }
}
