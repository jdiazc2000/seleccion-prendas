import { Component, Input, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../../shared/toast.service';
import { ClothingCategory, CATEGORY_LABEL, ClothingItem } from '../../models/clothing.model';
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
          <p class="eyebrow">{{ editingItem() ? 'Editar prenda' : 'Nueva prenda' }}</p>
          <h1>{{ editingItem() ? 'Editar prenda del closet' : 'Subir prenda al closet' }}</h1>
          <p class="muted">
            {{
              editingItem()
                ? 'Actualiza los datos o cambia la foto de esta prenda.'
                : 'Agrega una foto y clasifica la prenda para usarla en el combinador.'
            }}
          </p>
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
            Marca
            <input
              type="text"
              name="brand"
              [(ngModel)]="brand"
              placeholder="Ejemplo: Nike, Zara, H&M"
            />
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
              [required]="!editingItem()"
            />
            <label class="photo-picker" for="clothing-photo">
              <span class="photo-icon" aria-hidden="true"><span class="material-symbols-outlined">
                upload
              </span></span>
              <span class="photo-copy">
                <strong>{{
                  processingImage()
                    ? 'Quitando fondo...'
                    : selectedFile
                      ? 'Cambiar foto'
                      : editingItem()
                        ? 'Cambiar foto'
                        : 'Seleccionar foto'
                }}</strong>
                <small>{{ processingMessage() || selectedFile?.name || 'PNG, JPG o WEBP' }}</small>
              </span>
              <span class="photo-action">Explorar</span>
            </label>
          </div>

          <button class="btn btn-primary" type="submit" [disabled]="loading() || processingImage()">
            {{
              processingImage()
                ? 'Procesando imagen...'
                : loading()
                  ? (editingItem() ? 'Actualizando...' : 'Subiendo...')
                  : (editingItem() ? 'Actualizar prenda' : 'Guardar prenda')
            }}
          </button>

          <a class="btn btn-secondary" [routerLink]="editingItem() ? '/catalog' : '/wardrobe'">
            {{ editingItem() ? 'Volver al catálogo' : 'Volver al combinador' }}
          </a>

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
            @if (brand) {
              <span>{{ brand }}</span>
            }
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
export class UploadClothingPageComponent implements OnInit, OnDestroy {
  readonly clothingService = inject(ClothingService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  readonly labels = CATEGORY_LABEL;

  @Input() id?: string;

  readonly editingItem = signal<ClothingItem | null>(null);

  name = '';
  category: ClothingCategory = 'top';
  color = '';
  brand = '';
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

  async ngOnInit(): Promise<void> {
    if (!this.id) return;

    if (!this.clothingService.clothingItems().length) {
      await this.clothingService.loadClothingItems();
    }

    const item = this.clothingService.getById(this.id);

    if (!item) {
      this.error.set('No se encontró la prenda a editar.');
      return;
    }

    this.editingItem.set(item);
    this.name = item.name;
    this.category = item.category;
    this.brand = item.brand ?? '';
    this.color = item.color ?? '';

    this.selectedStyles.clear();
    (item.style ?? '')
      .split(',')
      .map((style) => style.trim())
      .filter(Boolean)
      .forEach((style) => this.selectedStyles.add(style));

    this.previewUrl.set(item.image_url);
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    const selectionId = ++this.imageSelectionId;

    this.error.set(null);
    this.success.set(null);

    if (!file) {
      this.replacePreview(this.editingItem()?.image_url ?? null);
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
      this.replacePreview(this.editingItem()?.image_url ?? null);
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

    const editing = this.editingItem();

    if (!editing && !this.selectedFile) {
      this.error.set('Selecciona una imagen para la prenda.');
      return;
    }

    if (!this.name.trim()) {
      this.error.set('Ingresa el nombre de la prenda.');
      return;
    }

    this.loading.set(true);

    try {
      if (editing) {
        await this.clothingService.updateClothingItem(editing.id, {
          name: this.name.trim(),
          category: this.category,
          brand: this.brand.trim() || undefined,
          color: this.color.trim() || undefined,
          style: Array.from(this.selectedStyles).join(', ') || undefined,
        });

        if (this.selectedFile) {
          await this.clothingService.replaceClothingImage(editing, this.selectedFile);
        }

        this.toast.success('Prenda actualizada correctamente ♡');
        await this.router.navigateByUrl('/catalog');
      } else {
        const { imagePath, imageUrl } = await this.clothingService.uploadClothingImage(this.selectedFile!);

        await this.clothingService.createClothingItem({
          name: this.name.trim(),
          category: this.category,
          image_path: imagePath,
          image_url: imageUrl,
          brand: this.brand.trim() || undefined,
          color: this.color.trim() || undefined,
          style: Array.from(this.selectedStyles).join(', ') || undefined,
        });

        this.success.set('Prenda guardada correctamente ♡');
        this.toast.success('Prenda guardada correctamente ♡');
        this.resetForm();
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : editing
            ? 'No se pudo actualizar la prenda.'
            : 'No se pudo guardar la prenda.';

      this.error.set(message);
      this.toast.error(message);
    } finally {
      this.loading.set(false);
    }
  }

  private resetForm(): void {
    this.name = '';
    this.category = 'top';
    this.brand = '';
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
    if (currentUrl?.startsWith('blob:')) URL.revokeObjectURL(currentUrl);
    this.previewUrl.set(url);
  }
}
