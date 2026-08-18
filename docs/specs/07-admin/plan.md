# Plan — Hito 7: Admin MVP

Orden de trabajo sugerido. Contrato y criterios → `[spec.md](./spec.md)`.  
Actualiza el estado de cada paso (`⬜` / `🔄` / `✅`) al avanzar.

Regla del hito: **cada paso deja la aplicación funcionando**. Primero se lee, después se escribe.

## Paso 0 — Decisiones técnicas (antes de código) ✅

1. **Modelos.** Se amplían los exports de `menu/api.ts` con `Dish`, `Section` y `Translation` y el admin los reutiliza como tipos de lectura; `admin/util/admin.model.ts` guarda solo DTOs de escritura y modelos de vista. Motivo: una sola verdad sobre el esquema, y un cambio en `menu` rompe `admin` en compilación.
2. **Esquema en Supabase (verificado).** Tabla de unión: `dish_allergens`, PK `(dish_id, allergen_id)`, cascada desde `dishes` y `allergens`. Traducciones con `UNIQUE (entidad, language_code)` → `upsert` con `onConflict`. `languages` solo tiene `es` y `en`. Detalle completo en la spec (§5, «Reglas derivadas del esquema»).
3. **Autorización.** Las políticas de escritura exigen `is_admin()`, no solo sesión, y `profiles` no era legible desde el cliente (RLS activo sin políticas). Se añade política `SELECT` en `profiles` para `id = auth.uid()` y un `adminGuard` → resuelto en el Paso 0b.
4. **Escritura multi-tabla.** Secuencia ordenada desde `AdminClient` (sin RPC): `dishes` → `dish_translations` → `dish_allergens`. Un fallo a medias deja el plato incompleto pero corregible desde el panel.
5. **Dónde vive el estado.** `AdminStore` en `admin/data/admin.store.ts` con signals y computed, patrón de `MenuService`, pero **provisto en la ruta de** `admin` (no `root`) para que se destruya al salir del panel. Las mutaciones y el optimismo viven en el store; `admin-page` solo orquesta.

## Paso 0b — Autorización por rol ✅

Consecuencia del hallazgo del Paso 0; va antes de escribir nada, porque condiciona si el panel es alcanzable.

- Migración aplicada en el dashboard (fuera del repo): política `profiles_read_own` — `SELECT` para `authenticated` con `using (id = auth.uid())`, de modo que el cliente pueda leer su propio rol. Es la única política de `profiles`: sin `insert` / `update`, el rol no es auto-asignable desde el cliente. Sin riesgo de recursión, porque `is_admin()` es `SECURITY DEFINER`.
- `auth/data/profile.client.ts`: lee el rol del usuario actual. `profiles` es dominio de `auth`, no infra: **no** se añade a `SupabaseService`.
- `auth/feature/admin.guard.ts`: `adminGuard` exige `role = 'admin'`, consultando en cada activación (sin caché; si el panel crece en rutas hijas, revisar).
- Pantalla de permisos insuficientes en `auth/feature/forbidden-page/`, con botón de cerrar sesión para poder entrar con otra cuenta. Se cuelga como ruta del shell (`app.routes.ts`) apuntando a `authRoutes`, que hoy solo sirve `login`.
- `app.routes.ts`: `/admin` con `canActivate: [authGuard, adminGuard]` — dos guards en cadena, una responsabilidad cada uno.
- Export en `auth/api.ts` y actualización de la lista de contratos en `AGENTS.md`.
- Verificado: política y RLS confirmados en `pg_policies`, `/admin` sin sesión sigue redirigiendo a `/login?returnUrl=%2Fadmin`, pantalla de permisos correcta a 1280px y ~390px, `pnpm build` sin errores.
- Pendiente de comprobación manual (requiere credenciales): entrar con la cuenta admin y confirmar que llega al panel y no a `/forbidden`. El caso `viewer` exigiría crear una cuenta de prueba.

Nota: no hay trigger sobre `auth.users`, así que un usuario registrado no tiene fila en `profiles`. Es seguro por defecto (sin fila, `is_admin()` es falso), pero dar acceso a alguien nuevo del staff exige crear su fila a mano en el dashboard.

## Paso 1 — Datos: modelos, cliente y mappers ✅

Decisiones del paso: se comparte el **modelo de dominio**, no el **contrato de transporte**. Y solo se define lo que consumen los Pasos 2 y 3: los DTOs de escritura llegan en el paso que los usa, cuando el formulario haya fijado su forma real.

- `menu/api.ts`: exportar los tipos `Dish`, `Section` y `Translation` (`Allergen` ya sale). Nada más: ni mappers, ni `menu.type.ts`, ni las funciones de `menu-localization.ts`.
- `admin/util/admin.model.ts`: modelo de vista de la lista, `AdminDishRow` con `name` ya resuelto y `missingLanguages: LanguageCode[]` (una lista, no un booleano: el staff necesita saber **qué** idioma falta).
- `admin/util/admin-translation.ts`: `resolveAdminName` (español con fallback a inglés) y `findMissingLanguages`. Regla fijada: **un idioma falta cuando no tiene** `name`; la `description` es opcional en la carta y no cuenta como incompleto, o el aviso perdería significado.
- `admin/util/price.ts`: `centsToEuros` para la lista. `eurosToCents` (`Math.round(euros * 100)`, el único punto de redondeo) se añade en el Paso 4, con el input que la alimenta.
- `admin/data/admin.type.ts`: tipos `Raw*` propios, duplicados de `menu.type.ts` a propósito. El transporte va pegado a los `select` de cada cliente y no viaja por un barrel.
- `admin/data/admin.mapper.ts`: raw → tipos de `@menu/api`, patrón de `menu.mapper.ts`.
- `admin/data/admin.client.ts`: `getDishes()` (todos, también los no disponibles), `getSections()` (todas, incluidas las vacías) y `getAllergens()` (catálogo completo para el `MultiSelect`), ordenados por `display_order` / `code`. Los errores se lanzan; los captura el store en el Paso 2.
- `admin/api.ts` no cambia: cliente y store son internos del dominio.
- Verificado: `pnpm build` sin errores. La prueba visual llega en el Paso 3.

Coste conocido y aceptado: los `select` de platos y secciones quedan duplicados entre `MenuClient` y `AdminClient`, así que un cambio de esquema obliga a tocar los dos.

## Paso 2 — Store de admin (solo lectura) ✅

- Signals: `dishes`, `sections`, `allergens`, `status` (idle | loading | ready | error).
- Computed: agrupación de platos por sección respetando la jerarquía, y filtros en cliente (búsqueda, orden por precio o nombre, disponibilidad).
- Detectar traducción incompleta para poder avisar en la lista.

## Paso 3 — Pantalla de lectura ✅

- `admin-page` (SMART) sustituye al stub del Hito 6, conservando el logout. Inyecta `LanguageService` para que el idioma guardado se aplique al panel.
- Chrome vía ngx-translate: claves `admin.*` en `public/i18n/{es,en}.json` (sección propia, no bajo `auth`). Logout sigue en `auth.logout`.
- Navegación por pestañas con PrimeNG `TabsModule` (`p-tabs`): **Platos** y **Secciones**.
- En la pestaña de Platos: `admin-filters` y `admin-dish-row` (presentational, aún sin acciones de escritura).
- Estados: cargando, error con reintento, vacío, con datos.
- CSS: un único componente de fila con `grid` que se recoloca en el breakpoint.
- **Verificar a ~390px y en escritorio, y en ES/EN, antes de seguir.**

## Paso 4 — Mutaciones rápidas en la lista ⬜

Las dos tareas más frecuentes, sin abrir formularios:

- Toggle de disponibilidad: optimista, con reversión y toast si falla.
- Precio en línea: Enter o `blur` confirma, Escape cancela, validación de número positivo, conversión a céntimos en un único punto.
- `AdminClient`: actualización parcial de plato.

## Paso 5 — Modal de plato (alta y edición) ⬜

- `admin-dish-form` dentro de un `p-dialog`; mismo componente para crear y editar.
- Campos comunes + `SelectButton` de idioma para los traducibles + `MultiSelect` de alérgenos.
- Escritura multi-tabla en este orden: `dishes` → `dish_translations` (`upsert` con `onConflict: 'dish_id,language_code'`) → `dish_allergens` (borrar las del plato e insertar las nuevas). Un idioma sin nombre no se guarda con cadena vacía: no se crea su fila y, si existía, se borra.
- `displayOrder` automático (máximo dentro de la sección + 1).
- Estados: validación por campo, guardando, error **dentro** del modal, éxito → cerrar + toast.

## Paso 6 — Borrado de plato ⬜

- Diálogo de confirmación con el nombre del plato y aviso de irreversibilidad.
- Una sola operación: borrar en `dishes`; traducciones y alérgenos caen por cascada.
- Acción destructiva visualmente diferenciada del cancelar.

## Paso 7 — Pestaña y modal de secciones ⬜

- Contenido de la pestaña "Secciones" (`p-tabpanel value="sections"`): listado / árbol de secciones existentes con botón de creación y acción de edición por sección.
- `admin-section-form` dentro de un `p-dialog`: nombre en es y en (ambos obligatorios) y selector de sección padre.
- `slug` derivado del nombre en español, con sufijo numérico si choca con el `UNIQUE`; `displayOrder` automático entre hermanas.
- Sin borrado en este hito.
- Recordar que una sección sin platos ni subsecciones no aparece en la carta pública.

## Paso 8 — Pulido y verificación ⬜

Checklist manual (criterios §12 del spec):

- [ ] `/admin` sigue protegido por `authGuard`
- [ ] Un usuario con sesión pero sin `role = 'admin'` no entra al panel
- [ ] Lista agrupada por sección con jerarquía correcta
- [ ] Toggle de disponibilidad se refleja en `/`
- [ ] Precio editado en línea se guarda y se muestra bien en `/`
- [ ] Alta de plato completa (sección, precio, alérgenos, traducciones)
- [ ] Edición en ambos idiomas con el conmutador
- [ ] Borrado con confirmación
- [ ] Alta y edición de sección en la pestaña de secciones, incluida una subsección
- [ ] Error de guardado dentro del modal, sin cerrarlo
- [ ] Filtros de búsqueda, orden y disponibilidad
- [ ] Usable a ~390px y en escritorio
- [ ] Carta pública sin regresiones en ES/EN
- [ ] Panel admin en ES/EN vía claves `admin.*`
- [ ] `pnpm build`
- [ ] Actualizar `docs/PROJECT.md` (Admin ✅) y `AGENTS.md` (exports de `admin/api.ts`)

## Orden de dependencias

```text
Paso 0 (decisiones + esquema)
    ↓
Paso 0b (política profiles + adminGuard)
    ↓
Paso 1 (modelos + cliente)
    ↓
Paso 2 (store lectura)
    ↓
Paso 3 (pantalla de lectura + responsive)
    ↓
Paso 4 (toggle + precio inline)
    ↓
Paso 5 (modal de plato)  ←── el más grande; no empezarlo con el 3 sin cerrar
    ↓
Paso 6 (borrado)   Paso 7 (secciones)   ←── independientes entre sí
    ↓
Paso 8 (QA + docs)
```

## Cómo retomar en un chat nuevo

```
@AGENTS.md @docs/PROJECT.md @docs/specs/07-admin/spec.md @docs/specs/07-admin/plan.md
— [Modo mentor | Implementa]. Hito 7, Paso N.
```
