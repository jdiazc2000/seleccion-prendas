import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ClothingCarouselComponent } from '../../components/clothing-carousel/clothing-carousel.component';
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
  imports: [FormsModule, RouterLink, ClothingCarouselComponent],
  template: `
    <div class="container page">
      <section class="hero card">
        <div>
          <p class="eyebrow">Outfits</p>
          <h1>Outfits guardados</h1>
          <p class="muted">Revisa las combinaciones que guardaste desde el carrusel.</p>
        </div>

        <a class="btn btn-primary" routerLink="/wardrobe">Armar otro outfit</a>
      </section>

      @if (outfitService.loading() || clothingService.loading()) {
        <p class="status-text">Cargando Outfits...</p>
      }

      @if (!outfits().length && !outfitService.loading()) {
        <section class="empty-state card big">
          <h2>Aún no tienes outfits guardados</h2>
          <p>Arma una combinación con los tres carruseles y presiona “Guardar outfit”.</p>
          <a class="btn btn-primary" routerLink="/wardrobe">Ir al combinador</a>
        </section>
      }

      <section class="outfits-grid">
        @for (view of outfits(); track view.outfit.id) {
          <article class="favorite-card card">
            @if (editingOutfitId() === view.outfit.id) {
              <div class="edit-form">
                <label>
                  Nombre
                  <input type="text" name="editName" [(ngModel)]="editName" placeholder="Nombre del outfit" />
                </label>

                <div class="edit-carousels">
                  <app-clothing-carousel
                    title="Superior"
                    emptyMessage="No tienes prendas en esta categoría."
                    [items]="tops()"
                    [selectedId]="editTopId"
                    (selectedChange)="editTopId = $event?.id ?? ''"
                  />

                  <app-clothing-carousel
                    title="Inferior"
                    emptyMessage="No tienes prendas en esta categoría."
                    [items]="bottoms()"
                    [selectedId]="editBottomId"
                    (selectedChange)="editBottomId = $event?.id ?? ''"
                  />

                  <app-clothing-carousel
                    title="Zapatos"
                    emptyMessage="No tienes prendas en esta categoría."
                    [items]="shoesItems()"
                    [selectedId]="editShoesId"
                    (selectedChange)="editShoesId = $event?.id ?? ''"
                  />
                </div>

                <div class="edit-actions">
                  <button class="btn btn-primary" type="button" (click)="saveEdit(view.outfit.id)">
                    Guardar
                  </button>
                  <button class="btn btn-secondary" type="button" (click)="cancelEdit()">Cancelar</button>
                </div>
              </div>
            } @else {
              <div class="favorite-header">
                <div>
                  <p class="eyebrow">Outfit</p>
                  <h2>{{ view.outfit.name || 'Combinación favorita' }}</h2>
                </div>

                <div class="card-actions">
                  <button class="edit-btn" type="button" (click)="startEdit(view)">Editar</button>
                  <button class="delete-btn" type="button" (click)="deleteOutfit(view.outfit.id)">
                    Eliminar
                  </button>
                </div>
              </div>

              <div class="favorite-images">
                <div class="mini-slot">
                  @if (view.top) {
                    <img [src]="view.top.image_url" [alt]="view.top.name" />
                  } @else {
                    <span>Superior</span>
                  }
                </div>

                <div class="mini-slot">
                  @if (view.bottom) {
                    <img [src]="view.bottom.image_url" [alt]="view.bottom.name" />
                  } @else {
                    <span>Inferior</span>
                  }
                </div>

                <div class="mini-slot">
                  @if (view.shoes) {
                    <img [src]="view.shoes.image_url" [alt]="view.shoes.name" />
                  } @else {
                    <span>Zapatos</span>
                  }
                </div>
              </div>
            }
          </article>
        }
      </section>
    </div>
  `,
})
export class OutfitsPageComponent implements OnInit {
  readonly clothingService = inject(ClothingService);
  readonly outfitService = inject(OutfitService);

  readonly outfits = computed<OutfitView[]>(() =>
    this.outfitService.outfits().map((outfit) => ({
      outfit,
      top: this.clothingService.getById(outfit.top_id),
      bottom: this.clothingService.getById(outfit.bottom_id),
      shoes: this.clothingService.getById(outfit.shoes_id),
    })),
  );

  readonly tops = computed(() => this.clothingService.getByCategory('top'));
  readonly bottoms = computed(() => this.clothingService.getByCategory('bottom'));
  readonly shoesItems = computed(() => this.clothingService.getByCategory('shoes'));

  readonly editingOutfitId = signal<string | null>(null);
  editName = '';
  editTopId = '';
  editBottomId = '';
  editShoesId = '';

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.clothingService.loadClothingItems(),
      this.outfitService.loadOutfits(),
    ]);
  }

  startEdit(view: OutfitView): void {
    this.editingOutfitId.set(view.outfit.id);
    this.editName = view.outfit.name ?? '';
    this.editTopId = view.outfit.top_id;
    this.editBottomId = view.outfit.bottom_id;
    this.editShoesId = view.outfit.shoes_id;
  }

  cancelEdit(): void {
    this.editingOutfitId.set(null);
  }

  async saveEdit(id: string): Promise<void> {
    await this.outfitService.updateOutfit(id, {
      name: this.editName.trim() || undefined,
      top_id: this.editTopId,
      bottom_id: this.editBottomId,
      shoes_id: this.editShoesId,
    });
    this.editingOutfitId.set(null);
  }

  async deleteOutfit(id: string): Promise<void> {
    await this.outfitService.deleteOutfit(id);
  }
}
