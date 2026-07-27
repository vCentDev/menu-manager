# Plan — Hito 6: Auth

Orden de trabajo sugerido. Contrato y criterios → [`spec.md`](./spec.md).  
Actualiza el estado de cada paso (`⬜` / `🔄` / `✅`) al avanzar.

## Paso 0 — Decisiones rápidas (antes de código) ✅

Cerrado:

1. Sin thin `AuthService` — `inject(SupabaseService)` en features.
2. Sí stub admin (placeholder + logout) en este hito.

## Paso 1 — i18n `auth.*` ✅

- Claves en `public/i18n/es.json` y `en.json` (§6 del spec + validation / eyebrow / subtitle / backToMenu).

## Paso 2 — Rutas y barrel `auth` ✅

- `auth/feature/auth.routes.ts` → `path: ''` → `LoginPageComponent`.
- `app.routes.ts`: `{ path: 'login', loadChildren: ... authRoutes }`.
- Export `authRoutes` (y `authGuard`) desde `auth/api.ts`.

## Paso 3 — `LoginPageComponent` (SMART) ✅

- Feature standalone: formulario email/password (reactive forms).
- PrimeNG: InputText, Password, Button, Message.
- `signInWithPassword`; loading / error genérico i18n; validación de campos.
- Éxito → `returnUrl` seguro o `/admin`.
- Estilos editoriales (marca + hoja) coherentes con Aura noir/slate.

## Paso 4 — Guard + redirect si ya hay sesión ✅

- `authGuard` (`CanActivateFn`) con `await getSession()`.
- Export vía `auth/api.ts`.
- En login: si hay sesión → redirect a `/admin`.

## Paso 5 — Stub admin protegido ✅

- `admin/feature/admin.routes.ts` + `admin-page` (placeholder + logout).
- Export `adminRoutes` en `admin/api.ts`.
- `app.routes.ts`: `{ path: 'admin', canActivate: [authGuard], loadChildren: ... }`.
- Logout → `signOut()` + `/login`.

## Paso 6 — Pulido y verificación ✅

Checklist:

- [x] `/` carta pública sin login
- [x] `/admin` → `/login` sin sesión (`returnUrl`)
- [x] Login OK → `/admin`
- [x] Login KO → error ES/EN (+ validación de formulario)
- [x] Logout → no reentrar a admin
- [x] `pnpm build`
- [x] Actualizar `docs/PROJECT.md` (Auth ✅, siguiente Admin)

## Orden de dependencias

```text
Paso 1 (i18n)
    ↓
Paso 2 (rutas auth + app.routes)
    ↓
Paso 3 (login UI)
    ↓
Paso 4 (guard)  ←── puede solaparse con 5 si el stub ya existe
    ↓
Paso 5 (admin stub + canActivate)
    ↓
Paso 6 (QA + docs)
```

## Cómo retomar (hito cerrado)

Hito 6 cerrado. Siguiente: Hito 7 — Admin MVP → [`docs/PROJECT.md`](../../PROJECT.md).
