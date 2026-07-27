# AGENTS.md — Menú Casa Mateu (menu-manager)

Instrucciones **estables** para agentes de IA. Lee este archivo al inicio de cada sesión.  
Roadmap, hitos y estado variable → [`docs/PROJECT.md`](docs/PROJECT.md).

## Proyecto

Gestor de carta online para el restaurante **Menú Casa Mateu**. Dominios: `menu` (público), `shared` (infra), `auth` (login + guard), `admin` (stub hasta CRUD en Hito 7).

## Stack

| Capa | Tecnología |
|------|------------|
| Package manager | **pnpm** |
| Framework | Angular **19.2** (standalone, signals, Zone.js) |
| UI | PrimeNG **21** + `@primeuix/themes` (preset **Aura**, primary **noir**, surface **slate**) |
| Backend | Supabase (Postgres + Auth + RLS) |
| i18n UI | `@ngx-translate/core` **18** + HTTP loader → `public/i18n/{lang}.json` |
| Estilos | CSS de componente + tokens `--p-*`. **Tailwind no instalado** (diferido) |
| Tipografía | DM Sans (cuerpo), Playfair Display (display), DM Mono (precios) — ver `src/styles.css` |

## Comandos

```bash
pnpm start         # ng serve → http://localhost:4200
pnpm build         # build producción
pnpm test          # Karma + Jasmine
```

Variables Supabase en `src/environments/environment*.ts` (`@env/*`). No commitear secretos.

## Estructura del repositorio

```
src/app/
  app.config.ts          # providers globales (router, HttpClient, PrimeNG, i18n)
  app.routes.ts          # shell: lazy load de dominios
  my-theme.preset.ts     # Aura + slate + noir
  shared/                # infra cross-cutting → api.ts
  menu/                  # dominio carta pública → api.ts
    data/ feature/ ui/ util/
  auth/                  # dominio auth → api.ts (login, guard, rutas)
  admin/                 # dominio admin → api.ts (stub page; CRUD en Hito 7)
public/
  i18n/es.json, en.json  # chrome UI (no platos/secciones)
  fonts/                 # fuentes self-hosted
```

## Arquitectura (DDD ligero)

Cuatro dominios: `menu`, `admin`, `auth`, `shared`. Capas por dominio:

- `feature/` — smart (routing, inyección, orquestación)
- `ui/` — presentational (inputs/outputs, sin lógica de negocio)
- `data/` — clientes Supabase, stores/servicios, mappers
- `util/` — modelos y funciones puras
- `api.ts` — **único barrel público** del dominio

Dependencias **hacia abajo** dentro del dominio. Entre dominios **solo** vía `*/api.ts`.

## Reglas de imports (obligatorias)

1. **Entre dominios** → solo barrels: `@shared/api`, `@menu/api`, `@auth/api`, `@admin/api`.
2. **Dentro del mismo dominio** → rutas relativas o alias al dominio (`@menu/data/...`). **No** importar el barrel del propio dominio desde archivos internos.
3. **Nunca** importar desde un barrel un archivo que ese mismo barrel exporta (evitar ciclos).
4. **App shell** → `@app/*`, `@shared/api`, lazy load de dominios.

Aliases TS: `@app/*`, `@menu/*`, `@shared/*`, `@admin/*`, `@auth/*`, `@env/*`.

## Exports públicos (contratos)

Actualizar esta lista cuando un dominio exporte algo nuevo vía su `api.ts`.

**`shared/api.ts`:** `SupabaseService`, `LanguageService`, `LanguageCode`, `provideSharedI18n`

**`menu/api.ts`:** `MenuService`, `menuRoutes`, tipos `SectionNode`, `LocalizedDish`, `LocalizedSection`, `OrderCriteria`, `Allergen`

**`auth/api.ts`:** `authRoutes`, `authGuard`

**`admin/api.ts`:** `adminRoutes`

## Routing

- `app.routes.ts` → lazy `menuRoutes` en `''` (home = carta).
- `/login` → lazy `authRoutes`; `/admin` → `canActivate: [authGuard]` + lazy `adminRoutes`.

## i18n

- **Chrome UI** → `public/i18n/{es,en}.json`, pipe `translate` o `TranslateService.instant()`.
- **Contenido de carta** → Supabase + localización en `menu/` (**no** ngx-translate).
- **`LanguageService`** = fuente de verdad (`lang` + `localStorage`); sync con `translate.use()` vía `effect`.
- **`provideSharedI18n()`** en `shared/data/i18n.providers.ts`; `provideHttpClient()` en `app.config.ts`.
- Loader: prefix `/i18n/`, `fallbackLang: 'es'`.

## Tema PrimeNG

- Preset: `src/app/my-theme.preset.ts` — **Aura**, surface **slate**, primary **noir**.
- Solo modo claro (`darkModeSelector: false`).
- Estilos custom: tokens `--p-surface-*`, `--p-text-*`, `--p-content-border-color`, `--p-primary-color`. Evitar hex sueltos salvo excepción justificada.

## Patrones UI (dominio menu)

| Componente | Rol |
|------------|-----|
| `menu-page` | SMART: `MenuService` + `LanguageService` |
| `menu-filters` | PRESENTATIONAL: `model()` search/sort/lang; I/O allergens |
| `menu-section` | PRESENTATIONAL recursivo |
| `dish-card` | PRESENTATIONAL; leader punteado nombre→precio |

**MenuService:** pipeline `dishes + lang → localizedDishes → visibleDishes → menuTree`. Filtros en cliente. Alérgenos = **excluir**. Orden precio **por sección**.

**Layout:** cabecera editorial + hoja (`menu-page__sheet`); banda filtros con `--sheet-padding-inline`.

## Patrones UI (dominio auth)

| Componente | Rol |
|------------|-----|
| `login-page` | SMART: form reactive + `SupabaseService`; redirect si ya hay sesión |
| `authGuard` | `CanActivateFn` async con `getSession()`; `returnUrl` en query |

**Login:** marca (eyebrow + título) + hoja con formulario; validación i18n por campo; error de credenciales genérico.

## Supabase

- `SupabaseService`: cliente singleton, `session`/`user`, `signInWithPassword`, `signOut`, `onAuthStateChange`.
- `MenuClient`: lectura pública dishes/sections con traducciones.
- Esquema/RLS en el proyecto Supabase; no hay carpeta `supabase/` en el repo.

## Convenciones de código

- Componentes **standalone**; imports explícitos en `@Component`.
- Preferir **signals** (`input`, `output`, `model`, `computed`, `signal`).
- PrimeNG v21: importar piezas concretas, no módulo monolítico.
- Labels dinámicos (p. ej. sort): claves i18n + `computed` que lea `lang()` + `instant()`.
- Código en inglés (nombres/tipos); UI vía i18n; comentarios solo si aportan.
- Respuestas al usuario en **español** salvo que pida otro idioma.

## Qué NO hacer

- No instalar Tailwind ni duplicar `@ngx-translate` sin acordarlo.
- No saltarse `api.ts` entre dominios.
- No meter textos de platos/secciones en JSON de ngx-translate.
- No commitear secretos / keys Supabase.
- No hacer `git commit` / `push` unless el usuario lo pide explícitamente.
- No ampliar scope: cambios mínimos y focalizados.

## Cómo retomar en un chat nuevo

```
@AGENTS.md @docs/PROJECT.md — [Modo mentor | Implementa]. Hito X, paso Y.
```

Si existe `docs/specs/<hito>/spec.md`, mencionarla también.

## Verificación

Tras cambios UI: ES/EN, móvil (~390px) y escritorio. Build: `pnpm build`.
