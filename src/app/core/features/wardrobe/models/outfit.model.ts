export interface Outfit {
  id: string;
  user_id: string;
  name?: string | null;
  top_id: string;
  bottom_id: string;
  shoes_id: string;
  is_favorite: boolean;
  created_at: string;
}

export interface CreateOutfit {
  name?: string;
  top_id: string;
  bottom_id: string;
  shoes_id: string;
}
