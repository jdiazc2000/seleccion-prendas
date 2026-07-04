import { Injectable, signal } from '@angular/core';
import { CreateOutfit, Outfit } from '../models/outfit.model';
import { supabase } from '../../../../supabase/supabase.client';
import { AuthService } from '../../../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class OutfitService {
  outfits = signal<Outfit[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private readonly authService: AuthService) {}

  async loadOutfits(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    const { data, error } = await supabase
      .from('outfits')
      .select('*')
      .eq('is_favorite', true)
      .order('created_at', { ascending: false });

    this.loading.set(false);

    if (error) {
      this.error.set(error.message);
      throw new Error(error.message);
    }

    this.outfits.set(data ?? []);
  }

  async createOutfit(payload: CreateOutfit): Promise<void> {
    const userId = this.authService.getUserId();

    const { error } = await supabase.from('outfits').insert({
      ...payload,
      user_id: userId,
      is_favorite: true,
    });

    if (error) {
      this.error.set(error.message);
      throw new Error(error.message);
    }

    await this.loadOutfits();
  }

  async deleteOutfit(id: string): Promise<void> {
    const { error } = await supabase.from('outfits').delete().eq('id', id);

    if (error) {
      this.error.set(error.message);
      throw new Error(error.message);
    }

    await this.loadOutfits();
  }
}
