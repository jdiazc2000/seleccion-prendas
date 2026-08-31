import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { guestGuard } from './core/auth/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'wardrobe',
    pathMatch: 'full',
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./core/features/auth/pages/login-page/login-page.component')
        .then((m) => m.LoginPageComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./core/features/auth/pages/register-page/register-page.component')
        .then((m) => m.RegisterPageComponent),
  },
  {
    path: 'wardrobe',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./core/features/wardrobe/pages/wardrobe-page/wardrobe-page.component')
        .then((m) => m.WardrobePageComponent),
  },
  {
    path: 'upload',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./core/features/wardrobe/pages/upload-clothing-page/upload-clothing-page.component')
        .then((m) => m.UploadClothingPageComponent),
  },
  {
    path: 'upload/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./core/features/wardrobe/pages/upload-clothing-page/upload-clothing-page.component')
        .then((m) => m.UploadClothingPageComponent),
  },
  {
    path: 'catalog',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./core/features/wardrobe/pages/catalog-page/catalog-page.component')
        .then((m) => m.CatalogPageComponent),
  },
  {
    path: 'outfits',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./core/features/wardrobe/pages/favorites-page/favorites-page.component')
        .then((m) => m.OutfitsPageComponent),
  },
  {
    path: '**',
    redirectTo: 'wardrobe',
  },
];
