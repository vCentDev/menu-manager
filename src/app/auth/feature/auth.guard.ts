import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '@shared/api';

export const authGuard: CanActivateFn = async (_route, state) => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  const session = await supabase.getSession();

  if (session) return true;

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
