export type ClothingCategory = 'top' | 'bottom' | 'shoes';

export interface ClothingItem {
  id: string;
  user_id: string;
  name: string;
  category: ClothingCategory;
  image_path: string;
  image_url: string;
  color?: string;
  style?: string;
  created_at: string;
}

export interface CreateClothingItem {
  name: string;
  category: ClothingCategory;
  image_path: string;
  image_url: string;
  color?: string;
  style?: string;
}