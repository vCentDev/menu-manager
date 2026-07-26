# Plan — Hito 6: Auth

Orden de trabajo sugerido. Contrato y criterios → [`spec.md`](./spec.md).  
Actualiza el estado de cada paso (`⬜` / `🔄` / `✅`) al avanzar.

## Paso 0 — Decisiones rápidas (antes de código)

Cerrar con recomendación si hace falta:

1. ¿Thin `AuthService` en `auth/data` o usar `SupabaseService` directo en el feature?  
   **Rec:** thin `AuthService` solo si el login acumula mapping de errores / redirects; si no, `inject(SupabaseService)` en `login-page` basta.
2. ¿Ruta admin stub en este hito?  
   **Rec:** sí (placeholder + logout), para probar el guard sin esperar al Hito 7.

## Paso 1 — i18n `auth.*`

- Añadir claves en `public/i18n/es.json` y `en.json` (§6 del spec).
- Sin UI todavía; solo diccionario.

## Paso 2 — Rutas y barrel `auth`

- `auth/feature/auth.routes.ts` → path `''` o hijos según diseño (`login` como path del lazy).
- Cablear en `app.routes.ts`: `{ path: 'login', loadChildren: () => import('@auth/api')... }`.
- Exportar `authRoutes` (y más adelante `authGuard`) desde `auth/api.ts`.

## Paso 3 — `LoginPageComponent` (SMART)

- Feature standalone: formulario email/password (reactive forms).
- PrimeNG: inputs, botón submit, `p-message` para error.
- Llamar a `signInWithPassword`; manejar loading y error genérico i18n.
- Éxito → `router.navigate` a `returnUrl` o `/admin`.
- Estilos mínimos coherentes con Aura noir/slate (sin rediseñar la carta).

## Paso 4 — Guard + redirect si ya hay sesión

- Implementar `authGuard` (`CanActivateFn`) exportado vía `auth/api.ts`.
- Resolver race de sesión inicial (`getSession()` / await).
- En login: si `session()` ya existe → redirect a `/admin`.

## Paso 5 — Stub admin protegido

- `admin/feature/admin.routes.ts` + página placeholder (título + botón logout).
- Exportar `adminRoutes` en `admin/api.ts`.
- En `app.routes.ts`: `{ path: 'admin', canActivate: [authGuard], loadChildren: ... }`.
- Logout → `signOut()` + navegar a `/login` o `/`.

## Paso 6 — Pulido y verificación

Checklist manual:

- [ ] `/` carta pública sin login
- [ ] `/admin` → `/login` sin sesión
- [ ] Login OK → `/admin`
- [ ] Login KO → error ES/EN
- [ ] Logout → no reentrar a admin
- [ ] `pnpm build`
- [ ] Actualizar `docs/PROJECT.md` (Auth ✅, siguiente Admin)

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

## Cómo retomar en un chat nuevo

```
@AGENTS.md @docs/PROJECT.md @docs/specs/06-auth/spec.md @docs/specs/06-auth/plan.md
— Modo mentor. Continúa Hito 6, Paso N.
```
