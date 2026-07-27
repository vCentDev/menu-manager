# Spec — Hito 7: Admin MVP

Estado: ⬜ pendiente  
Dependencias: `authGuard` y `/admin` protegido (Hito 6), RLS de escritura para autenticados, modelos de `menu/`  
Relacionado: [`docs/PROJECT.md`](../../PROJECT.md) · [`AGENTS.md`](../../../AGENTS.md) · [`06-auth/spec.md`](../06-auth/spec.md)

## 1. Objetivo

Permitir al staff gestionar los platos y las secciones de la carta desde el panel autenticado, sin entrar en Supabase a mano. Sustituye el stub `admin-page` del Hito 6.

## 2. Usuarios y contexto

| Actor | Contexto de uso |
|-------|-----------------|
| Staff (sala/cocina) | Móvil, en mitad del servicio: marcar platos como no disponibles |
| Staff (gestión) | Escritorio, sentado: alta de platos, precios, traducciones, secciones |

El uso móvil no es secundario: la tarea más frecuente se hace desde el teléfono.

## 3. Tareas del staff (por frecuencia)

1. Habilitar y deshabilitar platos
2. Modificar el precio de un plato
3. Añadir un plato
4. Editar el resto de datos de un plato (traducciones, alérgenos, sección, imagen)
5. Eliminar un plato
6. Añadir y editar secciones
7. Reordenar platos y secciones

La frecuencia manda en el diseño: las tareas 1 y 2 se resuelven **en la propia lista**, sin abrir formularios. La 4 vive en un modal.

## 4. Alcance

### Incluye

1. Dominio `admin/` con capas DDD (`data/`, `feature/`, `ui/`, `util/`, `api.ts`).
2. Política `SELECT` en `profiles` y `adminGuard` en `auth/`, para que el panel exija el rol que ya exige la RLS.
3. `AdminClient` + store para lectura y escritura de platos y secciones.
4. Pantalla principal: platos agrupados por sección, con filtros.
5. Edición en línea del precio y toggle de disponibilidad.
6. Modal de alta/edición de plato (campos comunes + traducibles + alérgenos).
7. Borrado de plato con diálogo de confirmación.
8. Gestión de secciones (alta y edición) en modal secundario, incluida la elección de sección padre.
9. Layout adaptable: filas densas en escritorio, apiladas en móvil (~390px).

### Fuera de alcance

- Reordenar platos y secciones por arrastre (`displayOrder` se calcula automáticamente).
- Eliminar secciones (implica decidir qué pasa con sus platos y subsecciones).
- Subida de imágenes a Storage: `imageUrl` se introduce como URL.
- Crear o editar el catálogo de alérgenos (solo se asignan los existentes).
- Descripción de sección (existe en el modelo, no se usa en la carta).
- Roles o permisos más finos que `admin` / `viewer` (no hay gestión de usuarios ni de roles desde el panel).
- Traducción de la interfaz del panel: los textos van en español, escritos directamente en las plantillas.

## 5. Datos por entidad

### Sección (`sections` + `section_translations`)

**Comunes**

| Campo | Regla |
|-------|-------|
| `parentId` | Opcional. Selector de sección padre; vacío = sección raíz |
| `slug` | Derivado del nombre en español (minúsculas, sin acentos, guiones). No editable en el MVP |
| `displayOrder` | Automático: máximo entre hermanas + 1 |

**Traducibles**

| Campo | Regla |
|-------|-------|
| `name` | Obligatorio en **es y en** (una sección sin nombre rompe la carta) |

### Plato (`dishes` + `dish_translations` + alérgenos)

**Comunes**

| Campo | Regla |
|-------|-------|
| `sectionId` | Obligatorio |
| `priceCents` | Obligatorio. Se introduce en euros y se persiste en céntimos (entero) |
| `isAvailable` | Por defecto `true` |
| `imageUrl` | Opcional, URL externa |
| `allergens` | Lista, `MultiSelect` sobre el catálogo existente |
| `displayOrder` | Automático: máximo dentro de su sección + 1 |

**Traducibles**

| Campo | Regla |
|-------|-------|
| `name` | Obligatorio al menos en un idioma |
| `description` | Opcional |

El plato **no tiene** un campo “idioma”: tiene un mapa de traducciones. En el modal se conmuta el idioma con un `SelectButton` de PrimeNG y se editan `name` y `description` del idioma activo.

Ojo con la distinción: el **contenido** de la carta sigue siendo bilingüe (es/en), porque la carta pública lo es. Lo que no se traduce es la **interfaz** del panel (§10).

### Reglas derivadas del código existente

- **Traducción faltante:** `resolveTranslation` cae al otro idioma (es ↔ en). Se mantiene ese comportamiento; el admin **marca visualmente** los platos con traducción incompleta para que el staff los complete.
- **Secciones vacías:** `buildMenuTree` descarta las secciones sin platos ni subsecciones, así que una sección recién creada **no aparece** en la carta pública hasta que tenga contenido. El admin debe reflejarlo para no confundir al staff.
- **Precio:** la carta lo formatea desde `priceCents`; el admin nunca debe guardar decimales flotantes.

### Reglas derivadas del esquema (confirmadas en el Paso 0)

- **Tabla de unión:** `dish_allergens`, PK compuesta `(dish_id, allergen_id)`, `ON DELETE CASCADE` hacia `dishes` y `allergens`. Asignar alérgenos = borrar las filas del plato e insertar las nuevas.
- **Borrado de plato:** basta con borrar en `dishes`; traducciones y alérgenos caen por cascada.
- **Traducciones:** `UNIQUE (dish_id, language_code)` y `UNIQUE (section_id, language_code)` permiten `upsert` con `onConflict`, sin leer antes.
- **Nombre vacío:** `dish_translations.name` es `NOT NULL`. Un idioma sin nombre **no se guarda como cadena vacía**: no se crea su fila (y si existía, se borra).
- **Idiomas cerrados:** `languages` contiene solo `es` y `en`, y las traducciones tienen FK contra ella.
- **Precio:** `CHECK (price_cents >= 0)` respalda la validación de cliente.
- **Slug:** `sections.slug` es `UNIQUE`. Al derivarlo del nombre en español hay que resolver colisiones con sufijo numérico.
- **Sección con platos:** `dishes.section_id` es FK `ON DELETE RESTRICT`; la BD ya impide borrar una sección con platos (coherente con no ofrecer borrado).
- **Sin transacciones:** PostgREST no agrupa varias llamadas en una transacción; ver §13.

## 6. Arquitectura

```
admin/
  api.ts                    # export: adminRoutes
  feature/
    admin.routes.ts
    admin-page/             # SMART: store + orquestación de modales
  ui/
    admin-filters/          # búsqueda, orden, disponibilidad
    admin-dish-row/         # fila/tarjeta: precio inline + toggle + acciones
    admin-dish-form/        # formulario del modal de plato
    admin-section-form/     # formulario del modal de sección
  data/
    admin.client.ts         # lecturas y escrituras Supabase
    admin.store.ts          # estado, carga y mutaciones
    admin.mapper.ts         # raw → tipos de @menu/api
    admin.type.ts           # tipos Raw propios (contrato de transporte)
  util/
    admin.model.ts          # modelo de vista de la lista + DTOs de escritura
    admin-translation.ts    # nombre a mostrar y detección de idiomas incompletos
    price.ts                # céntimos ↔ euros (único punto de redondeo)
```

### Dependencias

- `admin` → `@shared/api` (`SupabaseService`, `LanguageCode`).
- `admin` → `@menu/api` (tipos `Dish`, `Section`, `Translation`, `Allergen`).
- App shell → `@admin/api` (`adminRoutes`) tras `authGuard` y `adminGuard`.

### Modelos (decidido en el Paso 0)

Se distinguen tres familias de tipos y cada una tiene un dueño:

| Familia | Dónde vive | Motivo |
|---------|-----------|--------|
| Dominio / lectura (`Dish`, `Section`, `Translation`, `Allergen`) | `menu/util/menu.model.ts`, expuestos vía `@menu/api` | Son el mapeo fiel del esquema, idéntico para ambos dominios; una sola verdad evita que un cambio de BD se actualice a medias, y un cambio en `menu` rompe `admin` en compilación |
| Transporte (`Raw*`) | `admin/data/admin.type.ts`, duplicados de `menu.type.ts` | Detalle de cómo cada cliente habla con PostgREST: va pegado a sus `select` y no viaja por un barrel |
| Vista del admin (`AdminDishRow`) | `admin/util/admin.model.ts` | Solo tiene sentido en el panel; lleva el `name` resuelto y `missingLanguages: LanguageCode[]` |
| Escritura (DTOs de alta y edición) | `admin/util/admin.model.ts` | Forma propia del admin. Se definen en el paso que los usa (4 y 5), no en el Paso 1: el formulario fija su forma real |

`AdminClient` es propio: necesita el catálogo completo de alérgenos (que `MenuClient` no expone) y las escrituras. Lleva su propio mapper junto a sus `select`; la duplicación de los dos `select` de lectura con `MenuClient` es un coste aceptado, y obliga a tocar ambos si cambia el esquema.

**Traducción incompleta:** un idioma falta cuando no tiene `name`. La `description` es opcional en la carta y no cuenta, o casi todos los platos aparecerían marcados y el aviso perdería significado.

### Autorización (decidido en el Paso 0)

Las políticas RLS exigen `is_admin()` (existe fila en `profiles` con `role = 'admin'`), no solo sesión. Se añade una política `SELECT` en `profiles` para `id = auth.uid()` y un `adminGuard` en `auth/` que comprueba el rol, además de `authGuard`. El error de permisos se sigue manejando en la UI como red de seguridad.

Un usuario con sesión pero sin rol ve una pantalla de permisos insuficientes con opción de cerrar sesión, no una redirección silenciosa. El rol se consulta en `auth/data/profile.client.ts` (dominio de `auth`, no de `shared`) en cada activación del guard.

## 7. Pantallas y estados

### Pantalla `/admin` — platos agrupados por sección

| Estado | Qué se ve |
|--------|-----------|
| Cargando | Spinner (patrón de `menu-page`) |
| Error de carga | Mensaje + botón de reintentar |
| Vacío | “Todavía no hay platos” + acceso directo a crear el primero |
| Con datos | Cabecera, filtros y lista agrupada por sección |

**Cabecera:** título de la página, botón *nuevo plato*, acceso a *gestionar secciones*.

**Filtros:** búsqueda por nombre, orden por precio o nombre, y disponibilidad (disponibles / no disponibles / todos).

**Fila de plato:** nombre, precio editable en línea, toggle de disponibilidad, acciones (editar, eliminar) y aviso si falta traducción.

### Interacciones en la lista

| Interacción | Comportamiento |
|-------------|----------------|
| Toggle disponibilidad | Optimista: cambia al instante; si falla, se revierte y aparece un toast de error |
| Precio en línea | Enter o perder el foco confirma; Escape cancela; validación de número positivo; si falla el guardado, se revierte con toast |

### Modal de plato (alta y edición)

Mismo componente para crear y editar; en alta llega vacío con `isAvailable` en `true`.

| Estado | Qué se ve |
|--------|-----------|
| Validación | Mensaje por campo, patrón del login (`p-message` en `variant="simple"`) |
| Guardando | Botón en modo carga; no se puede reenviar |
| Error de guardado | `p-message` **dentro del modal**, sin cerrarlo (coherente con `login-page`) |
| Éxito | Se cierra el modal y aparece un toast de confirmación |
| Cancelar | Se cierra sin guardar |

### Confirmación de borrado

Diálogo con el nombre del plato, aviso de que es irreversible, y acción destructiva claramente diferenciada del cancelar.

### Modal de secciones

Lista de secciones existentes con acceso a alta y edición. Campos: nombre en es y en, y sección padre. Mismos estados que el modal de plato. Sin borrado en este hito.

### Móvil (~390px)

La fila y la tarjeta son **el mismo componente**: un `display: grid` que recoloca los campos en el breakpoint, no dos plantillas. En móvil el nombre ocupa el ancho y precio, disponibilidad y acciones se apilan debajo. Los controles táctiles (toggle, botones de acción) mantienen unos 44px de zona pulsable, lo que fija la altura mínima de la fila. Los datos que en escritorio se entienden por su columna necesitan etiqueta propia al apilarse.

## 8. Estructura de bloques

```
admin-page
  cabecera: título + nuevo plato + gestionar secciones
  admin-filters: búsqueda, orden, disponibilidad
  grupo por sección (nombre de sección)
    admin-dish-row  ×N
  estados: cargando / error / vacío
  modal plato → admin-dish-form
  modal secciones → admin-section-form
  diálogo de confirmación de borrado
```

Nombres BEM siguiendo la convención del proyecto (bloque = componente, como `.dish` en `dish-card` o `.section` en `menu-section`):

- `.admin-page`, `.admin-page__header`, `.admin-page__group`
- `.admin-filters`, `.admin-filters__toolbar`
- `.admin-dish-row`, `.admin-dish-row__name`, `.admin-dish-row__price`, `.admin-dish-row__actions`, modificador `.admin-dish-row--unavailable`

## 9. Intención visual

**Misma voz que la carta, distinta densidad.** Se conservan los tokens `--p-*`, las fuentes del proyecto y el gesto de hoja (`surface-0` sobre fondo, borde de 1px, mismo radio), pero el panel es una herramienta de trabajo: menos aire, filas compactas, escaneo vertical rápido.

- Playfair Display solo en el título de la página y en los nombres de sección.
- DM Sans en el cuerpo de las filas y formularios, a tamaño reducido.
- DM Mono en la columna de precios (alinea dígitos y refuerza la lectura vertical).
- Los platos no disponibles se atenúan, no se ocultan.
- Sin colores fuera de los tokens; la acción destructiva es la única excepción justificada.

## 10. Idioma de la interfaz

El panel es **solo en español**. No se añaden claves `admin.*` a `public/i18n/{es,en}.json` ni se usa `ngx-translate` en los componentes de `admin/`: los textos (títulos, etiquetas, botones, validaciones, confirmaciones y mensajes de error) van escritos en las plantillas.

Motivo: el staff del restaurante trabaja en español y el panel no es público, así que la traducción sería coste sin beneficio.

Dos cosas siguen siendo bilingües y no cambian:

- El **contenido de la carta**: `name` y `description` de platos y secciones se editan en es y en, con el conmutador del modal.
- La **carta pública** (`menu/`), que mantiene su i18n con `ngx-translate` intacta.

Los textos van en español directamente, sin envolverlos en constantes ni ficheros aparte. Si algún día el panel necesita otro idioma, se extraen entonces.

## 11. Decisiones tomadas

| Decisión | Elección |
|----------|----------|
| Reparto de pantallas | Una pantalla de platos agrupados por sección; secciones en modal aparte |
| Edición de plato | Modal, mismo componente para alta y edición |
| Idiomas en el formulario | `SelectButton` para conmutar; un idioma visible a la vez |
| Traducción faltante | Se mantiene el fallback actual y se avisa en el admin |
| Borrado de plato | Real, con diálogo de confirmación |
| Alérgenos | Se asignan en el modal con `MultiSelect` |
| Secciones | Alta y edición en modal; sin borrado |
| Error de guardado | Dentro del modal (`p-message`); toast solo para el éxito |
| Layout responsivo | Un solo componente de fila con `grid` que se recoloca |
| `displayOrder` | Automático (máximo + 1 en su ámbito) |
| `slug` | Derivado del nombre en español, no editable |
| Toggle disponibilidad | Optimista con reversión |
| Idioma de la interfaz | Solo español, sin `ngx-translate` en `admin/` |
| Modelos de lectura | Reutilizados de `@menu/api` (se amplían sus exports); escritura y vista en `admin/util` |
| Autorización | Política `SELECT` en `profiles` + `adminGuard` en `auth/`, además de `authGuard` |
| Escritura multi-tabla | Secuencia ordenada desde `AdminClient` (sin RPC); fallo parcial benigno y corregible desde el panel |
| Ámbito del store | `AdminStore` provisto en la ruta de `admin`, no en `root`: se destruye al salir |

## 12. Criterios de aceptación

1. `/admin` sin sesión sigue redirigiendo a `/login` (no se rompe el Hito 6).
1b. Un usuario con sesión pero sin `role = 'admin'` no entra al panel (`adminGuard`).
2. La pantalla lista los platos agrupados por sección, respetando la jerarquía de secciones.
3. El toggle de disponibilidad cambia el estado y se refleja en la carta pública.
4. El precio se edita desde la lista, se guarda en céntimos y se muestra correctamente en `/`.
5. Se puede crear un plato con sección, precio, alérgenos y traducciones, y aparece en la carta.
6. Se puede editar un plato en ambos idiomas mediante el conmutador.
7. Eliminar un plato pide confirmación y lo quita de la carta.
8. Se pueden crear y editar secciones, incluida una subsección con sección padre.
9. Los errores de guardado se muestran dentro del modal y no cierran el formulario.
10. Los filtros de búsqueda, orden y disponibilidad funcionan en cliente.
11. La pantalla es usable a ~390px y en escritorio.
12. La interfaz del panel está en español; la carta pública mantiene ES/EN sin regresiones.
13. Imports respetan barrels (`@shared/api`, `@admin/api`); sin ciclos.
14. `pnpm build` sin errores.

## 13. Riesgos / notas

- **Escrituras multi-tabla:** un plato toca `dishes`, `dish_translations` y `dish_allergens`, y PostgREST no las agrupa en una transacción. Orden acordado: `dishes` → `dish_translations` (upsert) → `dish_allergens` (borrar e insertar). Elegido así para que un fallo a medias deje el plato incompleto pero visible y corregible desde el panel, nunca datos huérfanos. Una RPC transaccional queda como mejora futura.
- **RLS:** las escrituras exigen `is_admin()`, no solo sesión. El `role` de `profiles` tiene default `viewer`, así que un usuario nuevo pasaría `authGuard` sin poder escribir; de ahí el `adminGuard`. Si aun así una operación falla por permisos, el mensaje debe ser comprensible y no filtrar detalles internos.
- **Caché de la carta pública:** `MenuService` recarga en `ngOnInit`, así que los cambios se ven al volver a `/`. Si en el futuro se cachea, habrá que invalidar.
- **Céntimos:** cualquier redondeo en euros debe hacerse en un único punto del código para evitar desfases.
- **Secciones sin contenido:** son invisibles en la carta por diseño de `buildMenuTree`; no es un bug.
- **Textos en español en plantillas:** es una decisión consciente, no un descuido. Queda como deuda conocida si el panel llegara a necesitar otro idioma.

## 14. Definición de hecho

Hito 7 cerrado cuando los criterios de la §12 pasan en local, `admin/api.ts` exporta lo necesario, el stub `admin-page` ha sido sustituido por la pantalla real, y `docs/PROJECT.md` marca Admin MVP como ✅.
