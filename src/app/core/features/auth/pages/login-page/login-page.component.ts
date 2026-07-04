import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  styleUrl: './login-page.component.scss',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="auth-page container">
      <div class="auth-card card">
        <p class="eyebrow">Bienvenida</p>
        <h1>Ingresar al closet</h1>
        <p class="muted">Inicia sesión para ver tus prendas y combinaciones guardadas.</p>

        <form class="form" (ngSubmit)="login()">
          <label>
            Correo
            <input
              type="email"
              name="email"
              [(ngModel)]="email"
              placeholder="correo@ejemplo.com"
              required
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              name="password"
              [(ngModel)]="password"
              placeholder="Tu contraseña"
              required
            />
          </label>

          <button class="btn btn-primary" type="submit" [disabled]="loading()">
            {{ loading() ? 'Ingresando...' : 'Ingresar' }}
          </button>
        </form>

        @if (error()) {
          <p class="error-text">{{ error() }}</p>
        }

        <p class="auth-switch">
          ¿No tienes cuenta?
          <a routerLink="/register">Crear cuenta</a>
        </p>
      </div>
    </section>
  `,
})
export class LoginPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';

  loading = signal(false);
  error = signal<string | null>(null);

  async login(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      await this.authService.signIn(this.email.trim(), this.password);
      await this.router.navigateByUrl('/wardrobe');
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No se pudo iniciar sesión.');
    } finally {
      this.loading.set(false);
    }
  }
}
