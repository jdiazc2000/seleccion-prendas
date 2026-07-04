import { Component, Input } from '@angular/core';
import { ClothingItem } from '../../models/clothing.model';

@Component({
  selector: 'app-outfit-preview',
  standalone: true,
  styleUrl: './outfit-preview.component.scss',
  template: `
    <aside class="preview card">
      <p class="eyebrow">Vista previa</p>
      <h2>Outfit actual</h2>

      <div class="outfit-stack">
        <div class="slot">
          @if (top) {
            <img [src]="top.image_url" [alt]="top.name" />
            <strong>{{ top.name }}</strong>
          } @else {
            <span>Parte superior</span>
          }
        </div>

        <div class="slot">
          @if (bottom) {
            <img [src]="bottom.image_url" [alt]="bottom.name" />
            <strong>{{ bottom.name }}</strong>
          } @else {
            <span>Parte inferior</span>
          }
        </div>

        <div class="slot shoes">
          @if (shoes) {
            <img [src]="shoes.image_url" [alt]="shoes.name" />
            <strong>{{ shoes.name }}</strong>
          } @else {
            <span>Zapatos</span>
          }
        </div>
      </div>
    </aside>
  `,
})
export class OutfitPreviewComponent {
  @Input() top: ClothingItem | null = null;
  @Input() bottom: ClothingItem | null = null;
  @Input() shoes: ClothingItem | null = null;
}
