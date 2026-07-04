import { Component, OnDestroy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ClothingCategory, CATEGORY_LABEL } from '../../models/clothing.model';
import { ClothingService } from '../../services/clothing.service';

@Component({
  selector: 'app-upload-clothing-page',
  standalone: true,
  styleUrl: './upload-clothing-page.component.scss',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="container page narrow">
      <section class="hero card">
        <div>
          <p class="eyebrow">Nueva prenda</p>
          <h1>Subir prenda al closet</h1>
          <p class="muted">Agrega una foto y clasifica la prenda para usarla en el combinador.</p>
        </div>
      </section>

      <section class="upload-grid">
        <form class="form card" (ngSubmit)="save()">
          <label>
            Nombre de la prenda
            <input
              type="text"
              name="name"
              [(ngModel)]="name"
              placeholder="Ejemplo: Blusa blanca"
              required
            />
          </label>

          <label>
            Categoría
            <select name="category" [(ngModel)]="category" required>
              <option value="top">{{ labels.top }}</option>
              <option value="bottom">{{ labels.bottom }}</option>
              <option value="shoes">{{ labels.shoes }}</option>
            </select>
          </label>

          <label>
            Color
            <input
              type="text"
              name="color"
              [(ngModel)]="color"
              placeholder="Ejemplo: Blanco, negro, azul"
            />
          </label>

          <fieldset class="style-fieldset">
            <legend>Estilo</legend>
            <div class="style-options" aria-label="Selecciona uno o más estilos">
              @for (option of styleOptions; track option) {
                <button
                  class="style-chip"
                  type="button"
                  [class.selected]="selectedStyles.has(option)"
                  [attr.aria-pressed]="selectedStyles.has(option)"
                  (click)="toggleStyle(option)"
                >
                  {{ option }}
                </button>
              }
            </div>
          </fieldset>

          <div class="photo-field">
            <span class="photo-label">Foto</span>
            <input
              id="clothing-photo"
              class="photo-input"
              type="file"
              accept="image/*"
              name="file"
              (change)="onFileSelected($event)"
              [disabled]="processingImage()"
              required
            />
            <label class="photo-picker" for="clothing-photo">
              <span class="photo-icon" aria-hidden="true"><span class="material-symbols-outlined">
                upload
              </span></span>
              <span class="photo-copy">
                <strong>{{ processingImage() ? 'Quitando fondo...' : selectedFile ? 'Cambiar foto' : 'Seleccionar foto' }}</strong>
                <small>{{ processingMessage() || selectedFile?.name || 'PNG, JPG o WEBP' }}</small>
              </span>
              <span class="photo-action">Explorar</span>
            </label>
          </div>

          <button class="btn btn-primary" type="submit" [disabled]="loading() || processingImage()">
            {{ processingImage() ? 'Procesando imagen...' : loading() ? 'Subiendo...' : 'Guardar prenda' }}
          </button>

          <a class="btn btn-secondary" routerLink="/wardrobe">Volver al combinador</a>

          @if (success()) {
            <p class="success-text">{{ success() }}</p>
          }

          @if (error()) {
            <p class="error-text">{{ error() }}</p>
          }
        </form>

        <aside class="preview card">
          <p class="eyebrow">Previsualización</p>
          <h2>{{ name || 'Nombre de la prenda' }}</h2>

          <div class="upload-preview-image">
            @if (previewUrl()) {
              <img [src]="previewUrl()" alt="Previsualización de prenda" />
            } @else {
              <span>Selecciona una imagen</span>
            }
          </div>

          <div class="tags center">
            <span>{{ labels[category] }}</span>
            @if (color) {
              <span>{{ color }}</span>
            }
            @for (style of selectedStyles; track style) {
              <span>{{ style }}</span>
            }
          </div>
        </aside>
      </section>
    </div>
  `,
})
export class UploadClothingPageComponent implements OnDestroy {
  readonly clothingService = inject(ClothingService);
  readonly labels = CATEGORY_LABEL;

  name = '';
  category: ClothingCategory = 'top';
  color = '';
  readonly styleOptions = ['Casual', 'Formal', 'Elegante'];
  readonly selectedStyles = new Set<string>();

  selectedFile: File | null = null;
  previewUrl = signal<string | null>(null);
  processingImage = signal(false);
  processingMessage = signal<string | null>(null);
  loading = signal(false);
  success = signal<string | null>(null);
  error = signal<string | null>(null);

  private imageSelectionId = 0;

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    const selectionId = ++this.imageSelectionId;

    this.error.set(null);
    this.success.set(null);

    if (!file) {
      this.replacePreview(null);
      this.selectedFile = null;
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.error.set('Selecciona un archivo de imagen válido.');
      input.value = '';
      return;
    }

    this.processingImage.set(true);
    this.processingMessage.set('Preparando el recorte automático...');

    try {
      const { removeBackground } = await import('@imgly/background-removal');
      const transparentPng = await removeBackground(file, {
        model: 'isnet_quint8',
        output: { format: 'image/png', quality: 1 },
        progress: () => {
          this.processingMessage.set(`Descargando modelo...`);
        },
      });

      if (selectionId !== this.imageSelectionId) return;

      const baseName = file.name.replace(/\.[^.]+$/, '') || 'prenda';
      this.selectedFile = new File([transparentPng], `${baseName}-sin-fondo.png`, {
        type: 'image/png',
      });
      this.replacePreview(URL.createObjectURL(transparentPng));
      this.processingMessage.set('Fondo eliminado · PNG transparente');
    } catch (error) {
      if (selectionId !== this.imageSelectionId) return;
      this.selectedFile = null;
      this.replacePreview(null);
      input.value = '';
      this.error.set(
        error instanceof Error
          ? `No se pudo quitar el fondo: ${error.message}`
          : 'No se pudo quitar el fondo de la imagen.',
      );
      this.processingMessage.set(null);
    } finally {
      if (selectionId === this.imageSelectionId) {
        this.processingImage.set(false);
      }
    }
  }

  toggleStyle(style: string): void {
    if (this.selectedStyles.has(style)) {
      this.selectedStyles.delete(style);
    } else {
      this.selectedStyles.add(style);
    }
  }

  async save(): Promise<void> {
    this.error.set(null);
    this.success.set(null);

    if (!this.selectedFile) {
      this.error.set('Selecciona una imagen para la prenda.');
      return;
    }

    if (!this.name.trim()) {
      this.error.set('Ingresa el nombre de la prenda.');
      return;
    }

    this.loading.set(true);

    try {
      const { imagePath, imageUrl } = await this.clothingService.uploadClothingImage(this.selectedFile);

      await this.clothingService.createClothingItem({
        name: this.name.trim(),
        category: this.category,
        image_path: imagePath,
        image_url: imageUrl,
        color: this.color.trim() || undefined,
        style: Array.from(this.selectedStyles).join(', ') || undefined,
      });

      this.success.set('Prenda guardada correctamente ♡');
      this.resetForm();
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No se pudo guardar la prenda.');
    } finally {
      this.loading.set(false);
    }
  }

  private resetForm(): void {
    this.name = '';
    this.category = 'top';
    this.color = '';
    this.selectedStyles.clear();
    this.selectedFile = null;
    this.processingMessage.set(null);
    this.replacePreview(null);
  }

  ngOnDestroy(): void {
    this.imageSelectionId++;
    this.replacePreview(null);
  }

  private replacePreview(url: string | null): void {
    const currentUrl = this.previewUrl();
    if (currentUrl) URL.revokeObjectURL(currentUrl);
    this.previewUrl.set(url);
  }
}
