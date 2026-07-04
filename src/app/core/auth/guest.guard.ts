import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { supabase } from '../../supabase/supabase.client';

export const guestGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return true;
  }

  return router.createUrlTree(['/wardrobe']);
};
