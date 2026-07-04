import { Injectable, signal } from '@angular/core';
import {
  ClothingCategory,
  ClothingItem,
  CreateClothingItem,
} from '../models/clothing.model';
import { supabase } from '../../../../supabase/supabase.client';
import { AuthService } from '../../../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ClothingService {
  clothingItems = signal<ClothingItem[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  private readonly bucketName = 'clothing-images';

  constructor(private readonly authService: AuthService) {}

  async loadClothingItems(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    const { data, error } = await supabase
      .from('clothing_items')
      .select('*')
      .order('created_at', { ascending: false });

    this.loading.set(false);

    if (error) {
      this.error.set(error.message);
      throw new Error(error.message);
    }

    this.clothingItems.set(data ?? []);
  }

  getByCategory(category: ClothingCategory): ClothingItem[] {
    return this.clothingItems().filter((item) => item.category === category);
  }

  getById(id: string): ClothingItem | undefined {
    return this.clothingItems().find((item) => item.id === id);
  }

  async uploadClothingImage(file: File): Promise<{
    imagePath: string;
    imageUrl: string;
  }> {
    const userId = this.authService.getUserId();
    const fileName = `${crypto.randomUUID()}.png`;
    const imagePath = `${userId}/${fileName}`;

    const { error } = await supabase.storage
      .from(this.bucketName)
      .upload(imagePath, file, {
        cacheControl: '3600',
        contentType: 'image/png',
        upsert: false,
      });

    if (error) {
      this.error.set(error.message);
      throw new Error(error.message);
    }

    const { data } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(imagePath);

    return {
      imagePath,
      imageUrl: data.publicUrl,
    };
  }

  async createClothingItem(payload: CreateClothingItem): Promise<void> {
    const userId = this.authService.getUserId();

    const { error } = await supabase.from('clothing_items').insert({
      ...payload,
      user_id: userId,
    });

    if (error) {
      this.error.set(error.message);
      throw new Error(error.message);
    }

    await this.loadClothingItems();
  }

  async deleteClothingItem(item: ClothingItem): Promise<void> {
    const { error: deleteDbError } = await supabase
      .from('clothing_items')
      .delete()
      .eq('id', item.id);

    if (deleteDbError) {
      this.error.set(deleteDbError.message);
      throw new Error(deleteDbError.message);
    }

    await supabase.storage
      .from(this.bucketName)
      .remove([item.image_path]);

    await this.loadClothingItems();
  }
}
