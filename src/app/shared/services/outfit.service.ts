import { Injectable, signal } from "@angular/core";
import { supabase } from "../../supabase/supabase.client";
import { Outfit, CreateOutfit } from "../interfaces/outfit.interface";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: 'root',
})
export class OutfitService {
  outfits = signal<Outfit[]>([]);
  loading = signal(false);

  constructor(private readonly authService: AuthService) {}

  async loadOutfits(): Promise<void> {
    this.loading.set(true);

    const { data, error } = await supabase
      .from('outfits')
      .select('*')
      .order('created_at', { ascending: false });

    this.loading.set(false);

    if (error) {
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
      throw new Error(error.message);
    }

    await this.loadOutfits();
  }

  async deleteOutfit(id: string): Promise<void> {
    const { error } = await supabase.from('outfits').delete().eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    await this.loadOutfits();
  }
}