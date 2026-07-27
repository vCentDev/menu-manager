import { inject, Injectable } from '@angular/core';

import { SupabaseService } from '@shared/api';

export type UserRole = 'admin' | 'viewer';

@Injectable({ providedIn: 'root' })
export class ProfileClient {
  private readonly db = inject(SupabaseService);

  async getRole(userId: string): Promise<UserRole | null> {
    const { data, error } = await this.db.supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;

    return (data?.role as UserRole) ?? null;
  }
}
