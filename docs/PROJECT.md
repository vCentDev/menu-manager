# PROJECT.md — Menú Casa Mateu

Mapa del producto, roadmap y estado del proyecto. **Actualiza este archivo al cerrar cada hito.**  
Para reglas de trabajo estables del agente → ver [`AGENTS.md`](../AGENTS.md).

## Visión

Carta online del restaurante **Menú Casa Mateu**: el cliente consulta platos, precios, alérgenos e idioma (ES/EN). El staff gestiona la carta (secciones, platos, traducciones) desde un panel admin autenticado.

## Estado actual

| Área | Estado |
|------|--------|
| Carta pública (lectura + filtros + i18n chrome + UI) | ✅ Completo |
| Auth (login, guard, rutas, stub admin) | ✅ Completo ([spec](specs/06-auth/spec.md)) |
| Admin MVP (CRUD carta) | ⬜ Pendiente — **siguiente** ([spec](specs/07-admin/spec.md) · [plan](specs/07-admin/plan.md)) |
| Specs formales por hito (`docs/specs/`) | ✅ Auth cerrado; Admin especificado |

**Siguiente trabajo:** Hito 7 — Admin MVP.

- Spec y plan ya escritos en `docs/specs/07-admin/`.
- CRUD secciones y platos detrás de `authGuard`.
- Sustituir el stub `admin-page` por la pantalla real.
- Panel **solo en español** (sin `ngx-translate`); UI alineada al tema Aura noir/slate.

## Roadmap

### Completados

#### Hito 1 — Supabase ✅
- Tablas de dominio (dishes, sections, traducciones, allergens, profiles, etc.)
- RLS para lectura pública de carta y escritura restringida a autenticados
- Traducciones es/en; secciones jerárquicas (`parent_id`)

#### Hito 2 — Shared ✅
- `SupabaseService` (cliente, session/user signals, signIn/signOut)
- `LanguageService` (signal `lang` + `localStorage`)
- Providers i18n y ficheros `public/i18n/es.json`, `en.json` (inicialmente vacíos)

#### Hito 3 — menu/data ✅
- `MenuClient`, mappers, modelos (`Dish`, `Section`, `Allergen`, `Localized*`, `SectionNode`, `OrderCriteria`)

#### Hito 4 — MenuService (store) ✅
- Pipeline: `dishes + lang → localizedDishes → visibleDishes → menuTree`
- Filtros: búsqueda, exclusión de alérgenos (`Set`), orden por precio **dentro de sección**
- `status`: idle | loading | ready | error

#### Hito 5 — UI carta pública ✅
- Smart: `menu-page`
- Presentational: `menu-filters`, `menu-section` (recursivo), `dish-card`
- Routing: home `''` vía lazy `menuRoutes`
- Filtros en cliente (signals + computed)

#### Hito 5b — ngx-translate ✅
- `@ngx-translate/core` + http-loader
- `provideSharedI18n()`; sync `LanguageService` ↔ `translate.use()`
- Chrome UI: `menu.*`, `filters.*`, `dish.allergens`
- Contenido de carta sigue viniendo del store localizado (no JSON i18n)

#### Hito 5c — Pulido visual ✅
- Preset PrimeNG: **Aura** + primary **noir** + surface **slate**
- Layout editorial: cabecera (eyebrow + título), hoja blanca (`menu-page__sheet`)
- Leader punteado nombre→precio en `dish-card`
- Banda de filtros en `surface-100` (sangrado con `--sheet-padding-inline`)
- Badges de alérgenos `severity="secondary"` (coherente con noir)

#### Hito 6 — Auth ✅
- Dominio `auth/`: `login-page`, `auth.routes.ts`, `authGuard`, export en `auth/api.ts`
- Login email/contraseña vía `SupabaseService` (sin `AuthService` thin)
- Reactive forms + validación i18n + error genérico de credenciales
- Rutas: `/login` lazy; `/admin` lazy con `canActivate: [authGuard]`
- Guard con `await getSession()` (evita race al bootstrap); `returnUrl` seguro
- Redirect `/login` → `/admin` si ya hay sesión
- Stub admin (`admin-page` + logout) para verificar el ciclo antes del CRUD
- i18n `auth.*` (login, validation, logout, admin placeholder)

### En curso / siguientes

#### Hito 7 — Admin MVP ⬜ (siguiente)

**Specs:** [`docs/specs/07-admin/spec.md`](specs/07-admin/spec.md) · [`plan.md`](specs/07-admin/plan.md)

**Objetivo:** gestionar la carta sin tocar Supabase a mano.

**Entregables previstos:**
1. Ampliar lazy routes `admin/*` detrás del guard (sustituir stub)
2. `AdminClient` + store + mappers (patrón como `MenuClient` / `MenuService`)
3. CRUD **secciones**: nombre es/en, jerarquía (`parentId`), `slug` y orden automáticos
4. CRUD **platos**: precio, sección, traducciones, alérgenos, `imageUrl` opcional, disponibilidad
5. Interacciones rápidas en la lista: toggle de disponibilidad y precio en línea
6. UI en español, adaptable a móvil, alineada al tema Aura noir/slate

#### Hito 8+ (ideas, no comprometidas)
- Subida de imágenes a Storage
- Roles / perfiles más allá de “autenticado”
- Tests e2e o unitarios del store
- Tailwind (si se decide; hoy diferido)
- Specs de hitos futuros (p. ej. Admin) en `docs/specs/<hito>/` — Auth documentado en `06-auth/`

## Decisiones tomadas (producto / arquitectura)

| Decisión | Detalle |
|----------|---------|
| Filtrado | En navegador (signals + computed), no en Supabase |
| Alérgenos en filtros | Modo **excluir** (chip activo = alérgeno excluido) |
| Orden por precio | Dentro de cada sección, no ranking global |
| i18n | Chrome UI → ngx-translate; platos/secciones/alérgenos → BD |
| Idioma | `LanguageService` = fuente de verdad |
| CSS | Component styles + tokens `--p-*`; Tailwind diferido |
| Tema | Aura, noir, slate; solo light mode |
| Gestor de paquetes | **pnpm** |
| Auth facade | Sin `AuthService`; features usan `SupabaseService` directo |
| Criterio del guard | Hay sesión (`getSession()`); sin roles/`profiles` en Hito 6 |
| Stub admin | Placeholder + logout en Hito 6; CRUD en Hito 7 |
| Idioma del panel admin | Solo español, sin `ngx-translate`; la carta pública sigue ES/EN |

## Deuda / mejoras menores conocidas

- Mensaje de error en `MenuService.load()` hardcodeado en ES (`'No se pudo cargar la carta'`) — candidata a i18n o reutilizar `menu.error` en UI.
- No hay carpeta `supabase/` de migraciones en el repo (esquema gestionado fuera).
- `README.md` aún es plantilla Angular CLI — actualizar cuando convenga.
- Stub `admin-page` sin estilos dedicados (aceptable hasta Hito 7).
- Las rutas de `auth/` (`/login`, `/forbidden`) se ven siempre en español aunque `localStorage.lang` sea `en`: `LanguageService` solo se instancia en `menu-page` / `MenuService`, así que nadie llama a `translate.use()` y ngx-translate usa `fallbackLang: 'es'`. Preexistente desde el Hito 6; de bajo impacto, porque el panel es solo español por decisión.

## Cómo retomar en un chat nuevo

```
@AGENTS.md @docs/PROJECT.md @docs/specs/07-admin/spec.md @docs/specs/07-admin/plan.md
— [Modo mentor | Implementa]. Hito 7, Paso N.
```

## Mantenimiento de este archivo

Al cerrar un hito:
1. Marcar el hito como ✅ en el roadmap.
2. Actualizar la tabla **Estado actual**.
3. Escribir **Siguiente trabajo** con 3–5 bullets concretos.
4. Añadir decisiones nuevas a la tabla si cambian el contrato del proyecto.
