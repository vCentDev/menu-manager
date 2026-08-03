import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '@shared/api';

@Injectable({ providedIn: 'root' })
export class ServiceNameService {
  private readonly db = inject(SupabaseService);
}
