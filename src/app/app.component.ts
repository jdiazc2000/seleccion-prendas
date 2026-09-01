import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  styleUrl: './app.component.scss',
  template: `
    <header class="app-header">
      <div class="container header-content">
        <div class="brand-row">
          <a class="brand" routerLink="/wardrobe">
            <span class="brand-icon">♡</span>
            <span>Closet App</span>
          </a>

          @if (authService.user()) {
            <button
              class="logout logout-mobile"
              type="button"
              title="Salir"
              aria-label="Salir"
              (click)="logout()"
            >
              <span class="material-symbols-outlined">meeting_room</span>
            </button>
          }
        </div>

        @if (authService.user()) {
          <nav class="nav">
            <a routerLink="/upload" routerLinkActive="active">Subir prenda</a>
            <a routerLink="/catalog" routerLinkActive="active">Catálogo</a>
            <a routerLink="/wardrobe" routerLinkActive="active">Combinar</a>
            <a routerLink="/outfits" routerLinkActive="active">Outfits</a>
            <button
              class="logout logout-desktop"
              type="button"
              title="Salir"
              aria-label="Salir"
              (click)="logout()"
            >
              <span class="material-symbols-outlined">meeting_room</span>
            </button>
          </nav>
        }
      </div>
    </header>

    <main>
      <router-outlet />
    </main>
  `,
})
export class AppComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  async logout(): Promise<void> {
    await this.authService.signOut();
    await this.router.navigateByUrl('/login');
  }
}
