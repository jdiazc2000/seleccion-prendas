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
        <a class="brand" routerLink="/wardrobe">
          <span class="brand-icon">♡</span>
          <span>Closet App</span>
        </a>

        @if (authService.user()) {
          <nav class="nav">
            <a routerLink="/wardrobe" routerLinkActive="active">Combinar</a>
            <a routerLink="/upload" routerLinkActive="active">Subir prenda</a>
            <a routerLink="/favorites" routerLinkActive="active">Favoritos</a>
            <button class="logout" type="button" (click)="logout()">Salir</button>
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
