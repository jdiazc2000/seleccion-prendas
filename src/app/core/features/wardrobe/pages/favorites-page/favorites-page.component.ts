import { Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClothingItem } from '../../models/clothing.model';
import { Outfit } from '../../models/outfit.model';
import { ClothingService } from '../../services/clothing.service';
import { OutfitService } from '../../services/outfit.service';

interface OutfitView {
  outfit: Outfit;
  top?: ClothingItem;
  bottom?: ClothingItem;
  shoes?: ClothingItem;
}

@Component({
  selector: 'app-favorites-page',
  styleUrl: './favorites-page.component.scss',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container page">
      <section class="hero card">
        <div>
          <p class="eyebrow">Favoritos</p>
          <h1>Outfits guardados</h1>
          <p class="muted">Revisa las combinaciones que guardaste desde el carrusel.</p>
        </div>

        <a class="btn btn-primary" routerLink="/wardrobe">Armar otro outfit</a>
      </section>

      @if (outfitService.loading() || clothingService.loading()) {
        <p class="status-text">Cargando favoritos...</p>
      }

      @if (!favorites().length && !outfitService.loading()) {
        <section class="empty-state card big">
          <h2>Aún no tienes outfits guardados</h2>
          <p>Arma una combinación con los tres carruseles y presiona “Guardar outfit”.</p>
          <a class="btn btn-primary" routerLink="/wardrobe">Ir al combinador</a>
        </section>
      }

      <section class="favorites-grid">
        @for (view of favorites(); track view.outfit.id) {
          <article class="favorite-card card">
            <div class="favorite-header">
              <div>
                <p class="eyebrow">Outfit</p>
                <h2>{{ view.outfit.name || 'Combinación favorita' }}</h2>
              </div>

              <button class="delete-btn" type="button" (click)="deleteOutfit(view.outfit.id)">
                Eliminar
              </button>
            </div>

            <div class="favorite-images">
              <div class="mini-slot">
                @if (view.top) {
                  <img [src]="view.top.image_url" [alt]="view.top.name" />
                  <strong>{{ view.top.name }}</strong>
                } @else {
                  <span>Superior</span>
                }
              </div>

              <div class="mini-slot">
                @if (view.bottom) {
                  <img [src]="view.bottom.image_url" [alt]="view.bottom.name" />
                  <strong>{{ view.bottom.name }}</strong>
                } @else {
                  <span>Inferior</span>
                }
              </div>

              <div class="mini-slot">
                @if (view.shoes) {
                  <img [src]="view.shoes.image_url" [alt]="view.shoes.name" />
                  <strong>{{ view.shoes.name }}</strong>
                } @else {
                  <span>Zapatos</span>
                }
              </div>
            </div>
          </article>
        }
      </section>
    </div>
  `,
})
export class FavoritesPageComponent implements OnInit {
  readonly clothingService = inject(ClothingService);
  readonly outfitService = inject(OutfitService);

  readonly favorites = computed<OutfitView[]>(() =>
    this.outfitService.outfits().map((outfit) => ({
      outfit,
      top: this.clothingService.getById(outfit.top_id),
      bottom: this.clothingService.getById(outfit.bottom_id),
      shoes: this.clothingService.getById(outfit.shoes_id),
    })),
  );

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.clothingService.loadClothingItems(),
      this.outfitService.loadOutfits(),
    ]);
  }

  async deleteOutfit(id: string): Promise<void> {
    await this.outfitService.deleteOutfit(id);
  }
}
