export type ClothingCategory = 'top' | 'bottom' | 'shoes';

export interface ClothingItem {
  id: string;
  user_id: string;
  name: string;
  category: ClothingCategory;
  image_path: string;
  image_url: string;
  color?: string | null;
  style?: string | null;
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

export const CATEGORY_LABEL: Record<ClothingCategory, string> = {
  top: 'Parte superior',
  bottom: 'Parte inferior',
  shoes: 'Zapatos',
};
