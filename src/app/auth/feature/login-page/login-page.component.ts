import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

import { SupabaseService } from '@shared/api';

@Component({
  selector: 'app-login-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule,
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent implements OnInit {
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected readonly loading = signal(false);
  protected readonly error = signal(false);

  async ngOnInit(): Promise<void> {
    const session = await this.supabase.getSession();
    if (session) {
      await this.router.navigateByUrl('/admin');
    }
  }

  protected async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(false);

    const { email, password } = this.form.getRawValue();

    try {
      const { error } = await this.supabase.signInWithPassword(email, password);

      if (error) {
        this.error.set(true);
        return;
      }

      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      const target =
        returnUrl?.startsWith('/') && !returnUrl.startsWith('//')
          ? returnUrl
          : '/admin';

      await this.router.navigateByUrl(target);
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  protected isInvalid(controlName: 'email' | 'password'): boolean {
    const c = this.form.controls[controlName];
    return c.invalid && c.touched;
  }
}
