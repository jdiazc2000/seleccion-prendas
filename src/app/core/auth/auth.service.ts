import { Injectable, signal } from '@angular/core';
import { User } from '@supabase/supabase-js';
import { supabase } from '../../supabase/supabase.client';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user = signal<User | null>(null);
  loading = signal(false);

  constructor() {
    this.loadCurrentUser();

    supabase.auth.onAuthStateChange((_event, session) => {
      this.user.set(session?.user ?? null);
    });
  }

  async loadCurrentUser(): Promise<void> {
    this.loading.set(true);

    const { data, error } = await supabase.auth.getUser();

    this.loading.set(false);

    if (error) {
      this.user.set(null);
      return;
    }

    this.user.set(data.user);
  }

  async signUp(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async signIn(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    this.user.set(null);
  }

  getUserId(): string {
    const currentUser = this.user();

    if (!currentUser) {
      throw new Error('No hay usuario autenticado.');
    }

    return currentUser.id;
  }
}
