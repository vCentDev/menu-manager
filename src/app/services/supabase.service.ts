import { Injectable, signal } from '@angular/core';
import {
  AuthChangeEvent,
  createClient,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private readonly client: SupabaseClient = createClient(
    environment.supabase.url,
    environment.supabase.anonKey,
  );

  readonly session = signal<Session | null>(null);
  readonly user = signal<User | null>(null);

  constructor() {
    void this.initializeAuthState();
  }

  get supabase(): SupabaseClient {
    return this.client;
  }

  async getSession(): Promise<Session | null> {
    const { data } = await this.client.auth.getSession();
    return data.session;
  }

  signInWithPassword(email: string, password: string) {
    return this.client.auth.signInWithPassword({ email, password });
  }

  signUp(email: string, password: string) {
    return this.client.auth.signUp({ email, password });
  }

  signOut() {
    return this.client.auth.signOut();
  }

  onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void,
  ) {
    return this.client.auth.onAuthStateChange(callback);
  }

  private async initializeAuthState(): Promise<void> {
    const session = await this.getSession();
    this.updateAuthState(session);

    this.client.auth.onAuthStateChange((_event, session) => {
      this.updateAuthState(session);
    });
  }

  private updateAuthState(session: Session | null): void {
    this.session.set(session);
    this.user.set(session?.user ?? null);
  }
}
