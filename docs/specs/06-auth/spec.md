# Spec — Hito 6: Auth

Estado: ✅ completo  

Dependencias: `SupabaseService` (session/user, signIn/signOut), RLS y usuarios staff en Supabase Auth  
Relacionado: [`docs/PROJECT.md`](../../PROJECT.md) · [`AGENTS.md`](../../../AGENTS.md) · plan: [`plan.md`](./plan.md)

## 1. Objetivo

Permitir que el **staff** del restaurante inicie sesión con email/contraseña y acceda a rutas de administración protegidas. La carta pública sigue siendo accesible sin autenticación.

## 2. Usuarios y contexto

| Actor | Necesidad |
|-------|-----------|
| Staff (admin) | Entrar con credenciales Supabase, llegar al área admin, cerrar sesión |
| Cliente (público) | Seguir viendo la carta en `/` sin login |

No hay registro self-service en este hito: las cuentas se crean en Supabase (Dashboard o proceso).

## 3. Alcance

### Incluye

1. Dominio `auth/` con capas DDD (`feature/`, opcional `data/`/`util/`, `api.ts`).
2. Página de login: email + contraseña, envío, estados loading/error.
3. Integración con `SupabaseService.signInWithPassword` / `signOut` (thin wrapper en `auth` solo si aporta claridad; no duplicar el cliente Supabase).
4. `authGuard` funcional: sin sesión → redirect a `/login` (con `returnUrl` opcional).
5. Rutas:
   - `/login` → lazy desde `@auth/api`
   - `/admin` (o `/admin/*`) → lazy stub mínimo **protegido** por el guard (placeholder hasta Hito 7)
6. i18n chrome: claves `auth.*` en `public/i18n/es.json` y `en.json`.
7. UX post-login: navegar a `returnUrl` o a `/admin` por defecto.
8. Si ya hay sesión y se visita `/login` → redirect a `/admin` (evitar login innecesario).
9. Logout accesible desde el stub admin (botón) para poder verificar el ciclo completo.

### Fuera de alcance

- Registro público / sign-up UI
- OAuth / magic link / recuperación de contraseña
- Roles o permisos más allá de “hay sesión” (p. ej. `profiles.role`)
- CRUD de carta (Hito 7)
- Tests e2e / unitarios obligatorios (opcionales)

## 4. Arquitectura

### Dominio `auth`

```
auth/
  api.ts                 # export: authRoutes, authGuard, (tipos/helpers si aplica)
  feature/
    login-page/          # SMART: formulario + SupabaseService / Auth facade
    auth.routes.ts
  data/                  # opcional: AuthService thin si el feature se ensucia
  util/                  # opcional: helpers de error mapping
```

### Dependencias

- `auth` → `@shared/api` (`SupabaseService`, `LanguageService` si hace falta idioma en login).
- `app.routes.ts` → lazy `@auth/api` y stub `@admin/api` (o ruta admin mínima en app hasta que exista feature admin).
- **No** importar `@menu/api` desde `auth` salvo necesidad real (evitar acoplar login a la carta).

### Guard

- Functional guard (`CanActivateFn`).
- Criterio: sesión presente (`SupabaseService.session()` o `getSession()` si hace falta await al bootstrap).
- Si no autenticado: `router.createUrlTree(['/login'], { queryParams: { returnUrl } })`.

### Admin stub (puente hacia Hito 7)

- Ruta protegida con un componente mínimo (“Admin — próximamente” + logout).
- Exportar `adminRoutes` desde `admin/api.ts` aunque el CRUD llegue en Hito 7.
- Motivo: el guard y el flujo login→admin se pueden verificar sin construir el CRUD.

## 5. UI / UX

- Estilo coherente con Aura noir/slate (tokens `--p-*`), tipografía del proyecto.
- Login: una composición clara (marca / título + formulario); no dashboard.
- Controles PrimeNG (InputText, Password o InputText type password, Button, Message).
- Errores de credenciales: mensaje genérico traducido (no filtrar si el email existe).
- Formulario: reactive forms o template-driven — preferir **reactive** con validación básica (email required, password required).

## 6. i18n

Claves mínimas sugeridas (anidadas):

```json
{
  "auth": {
    "login": {
      "title": "...",
      "email": "...",
      "password": "...",
      "submit": "...",
      "error": "..."
    },
    "logout": "..."
  }
}
```

Ajustar textos ES/EN reales en implementación. No meter contenido de carta en estos JSON.

## 7. Criterios de aceptación

1. Visitante sin sesión puede abrir `/` y ver la carta.
2. `/admin` sin sesión redirige a `/login` (conservando `returnUrl` si se implementa).
3. Login correcto con usuario staff → llega a `/admin` (o `returnUrl`).
4. Login incorrecto → mensaje de error traducido; no se navega a admin.
5. Con sesión activa, `/login` redirige a `/admin`.
6. Logout → sesión limpia; `/admin` vuelve a exigir login.
7. Textos de UI del flujo en ES y EN vía ngx-translate.
8. Imports respetan barrels (`auth/api`, `shared/api`); sin ciclos.
9. `pnpm build` sin errores.

## 8. Riesgos / notas

- Race al arrancar: el guard puede ejecutarse antes de que `initializeAuthState` termine. Preferir `await getSession()` en el guard o un flag/ready signal si hace falta.
- `signUp` ya existe en `SupabaseService` pero **no** se expone en UI en este hito.
- Usuarios de prueba: crearlos en Supabase Auth (no hardcodear passwords en el repo).

## 9. Definición de hecho

Hito 6 cerrado cuando los criterios de la §7 pasan en local, `auth/api.ts` y `admin/api.ts` exportan las rutas necesarias, y `docs/PROJECT.md` marca Auth como ✅ y Admin como siguiente.

**Estado de cierre:** cumplido (2026-07).
