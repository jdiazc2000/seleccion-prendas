import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../../shared/services/auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  styleUrl: './register-page.component.scss',
  imports: [FormsModule, RouterLink],
  template: `
    <section class="auth-page container">
      <div class="auth-card card">
        <p class="eyebrow">Crear cuenta</p>
        <h1>Arma tu closet digital</h1>
        <p class="muted">Crea una cuenta para guardar prendas, outfits y favoritos.</p>

        <form class="form" (ngSubmit)="register()">
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
              placeholder="Mínimo 6 caracteres"
              minlength="6"
              required
            />
          </label>

          <button class="btn btn-primary" type="submit" [disabled]="loading()">
            {{ loading() ? 'Creando...' : 'Crear cuenta' }}
          </button>
        </form>

        @if (success()) {
          <p class="success-text">{{ success() }}</p>
        }

        @if (error()) {
          <p class="error-text">{{ error() }}</p>
        }

        <p class="auth-switch">
          ¿Ya tienes cuenta?
          <a routerLink="/login">Ingresar</a>
        </p>
      </div>
    </section>
  `,
})
export class RegisterPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';

  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  async register(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    try {
      await this.authService.signUp(this.email.trim(), this.password);
      this.success.set('Cuenta creada. Si Supabase te pide confirmación, revisa el correo antes de ingresar.');

      setTimeout(() => {
        this.router.navigateByUrl('/login');
      }, 1200);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No se pudo crear la cuenta.');
    } finally {
      this.loading.set(false);
    }
  }
}
