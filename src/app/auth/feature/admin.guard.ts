import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { SupabaseService } from '@shared/api';
import { ProfileClient } from '../data/profile.client';

export const adminGuard: CanActivateFn = async (_route, state) => {
  const supabase = inject(SupabaseService);
  const profiles = inject(ProfileClient);
  const router = inject(Router);

  const session = await supabase.getSession();

  if (!session) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  try {
    const role = await profiles.getRole(session.user.id);
    if (role === 'admin') return true;
  } catch {
    // Si no se puede confirmar el rol, se deniega el acceso.
  }

  return router.createUrlTree(['/forbidden']);
};
