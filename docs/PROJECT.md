# PROJECT.md — Menú Casa Mateu

Mapa del producto, roadmap y estado del proyecto. **Actualiza este archivo al cerrar cada hito.**  
Para reglas de trabajo estables del agente → ver [`AGENTS.md`](../AGENTS.md).

## Visión

Carta online del restaurante **Menú Casa Mateu**: el cliente consulta platos, precios, alérgenos e idioma (ES/EN). El staff gestiona la carta (secciones, platos, traducciones) desde un panel admin autenticado.

## Estado actual

| Área | Estado |
|------|--------|
| Carta pública (lectura + filtros + i18n chrome + UI) | ✅ Completo |
| Auth (login, guard, rutas) | ⬜ Pendiente — **siguiente** ([spec](specs/06-auth/spec.md)) |
| Admin MVP (CRUD carta) | ⬜ Pendiente |
| Specs formales por hito (`docs/specs/`) | 🔄 Auth listo; Admin cuando toque |

**Siguiente trabajo:** Hito 6 — Auth.

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

### En curso / siguientes

#### Hito 6 — Auth ⬜ (siguiente)

**Specs:** [`docs/specs/06-auth/spec.md`](specs/06-auth/spec.md) · [`plan.md`](specs/06-auth/plan.md)

**Objetivo:** staff inicia sesión y accede a rutas admin protegidas.

**Entregables previstos:**
1. Dominio `auth/`: feature login (email/contraseña), `auth.routes.ts`, export en `auth/api.ts`
2. Uso de `SupabaseService.signInWithPassword` / `signOut` (o thin `AuthService` si conviene)
3. `authGuard` funcional para `/admin/*`
4. Rutas en `app.routes.ts`: p. ej. `/login` + lazy admin tras guard
5. i18n: claves `auth.*` (formulario, errores, logout)
6. UX: redirección post-login; sesión ya escuchada en `SupabaseService`
7. Stub admin mínimo (placeholder + logout) para verificar el guard antes del CRUD

**Fuera de alcance inicial (salvo decisión explícita):** registro público, OAuth, recuperación de contraseña.

#### Hito 7 — Admin MVP ⬜

**Objetivo:** gestionar la carta sin tocar Supabase a mano.

**Entregables previstos:**
1. Lazy routes `admin/*` detrás del guard
2. `AdminClient` + mappers (patrón como `MenuClient`)
3. CRUD **secciones**: nombre es/en, orden, jerarquía básica
4. CRUD **platos**: precio, sección, traducciones, alérgenos, `imageUrl` opcional, disponibilidad
5. i18n chrome `admin.*`
6. UI alineada al tema Aura noir/slate

#### Hito 8+ (ideas, no comprometidas)
- Subida de imágenes a Storage
- Roles / perfiles más allá de “autenticado”
- Tests e2e o unitarios del store
- Tailwind (si se decide; hoy diferido)
- Specs de hitos futuros (p. ej. Admin) en `docs/specs/<hito>/` — Auth ya documentado en `06-auth/`

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
| Dominios stubs | `auth/` y `admin/` existen con `api.ts` vacío hasta su hito |

## Deuda / mejoras menores conocidas

- Mensaje de error en `MenuService.load()` hardcodeado en ES (`'No se pudo cargar la carta'`) — candidata a i18n o reutilizar `menu.error` en UI.
- No hay carpeta `supabase/` de migraciones en el repo (esquema gestionado fuera).
- `README.md` aún es plantilla Angular CLI — actualizar cuando convenga.

## Cómo retomar en un chat nuevo

```
@AGENTS.md @docs/PROJECT.md @docs/specs/06-auth/spec.md @docs/specs/06-auth/plan.md
— [Modo mentor | Implementa]. Hito 6, Paso N.
```

## Mantenimiento de este archivo

Al cerrar un hito:
1. Marcar el hito como ✅ en el roadmap.
2. Actualizar la tabla **Estado actual**.
3. Escribir **Siguiente trabajo** con 3–5 bullets concretos.
4. Añadir decisiones nuevas a la tabla si cambian el contrato del proyecto.
