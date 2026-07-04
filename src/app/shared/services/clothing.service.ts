import { Injectable, signal } from '@angular/core';
import { supabase } from '../../supabase/supabase.client';
import { ClothingItem, ClothingCategory, CreateClothingItem } from '../interfaces/clothing.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ClothingService {
  clothingItems = signal<ClothingItem[]>([]);
  loading = signal(false);

  private readonly bucketName = 'clothing-images';

  constructor(private readonly authService: AuthService) {}

  async loadClothingItems(): Promise<void> {
    this.loading.set(true);

    const { data, error } = await supabase
      .from('clothing_items')
      .select('*')
      .order('created_at', { ascending: false });

    this.loading.set(false);

    if (error) {
      throw new Error(error.message);
    }

    this.clothingItems.set(data ?? []);
  }

  getByCategory(category: ClothingCategory): ClothingItem[] {
    return this.clothingItems().filter((item) => item.category === category);
  }

  async uploadClothingImage(file: File): Promise<{
    imagePath: string;
    imageUrl: string;
  }> {
    const userId = this.authService.getUserId();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExtension}`;
    const imagePath = `${userId}/${fileName}`;

    const { error } = await supabase.storage
      .from(this.bucketName)
      .upload(imagePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
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
      throw new Error(deleteDbError.message);
    }

    await supabase.storage
      .from(this.bucketName)
      .remove([item.image_path]);

    await this.loadClothingItems();
  }
}