# MenuManager

Aplicación para consultar y administrar la carta digital de un restaurante, desarrollada con Angular y Supabase.

Permite a los clientes consultar una carta multilingüe, buscar platos y excluir alérgenos. El personal autorizado dispone de un panel protegido desde el que puede actualizar precios y disponibilidad.

<!-- Cuando publiques la aplicación, descomenta este enlace:
[Ver demostración](https://URL-DE-LA-DEMO)
-->

<!-- Cuando añadas las capturas al repositorio, descomenta esta sección:
<p align="center">
  <img
    src="docs/images/menu-manager-preview.webp"
    alt="Vista de la carta pública de MenuManager"
    width="900"
  >
</p>
-->

## El problema

La carta de un restaurante cambia constantemente:

- algunos platos dejan de estar disponibles;
- los precios necesitan actualizarse;
- los clientes necesitan consultar información sobre alérgenos;
- el contenido puede tener que mostrarse en varios idiomas;
- los cambios deberían poder realizarse sin modificar y desplegar nuevamente el frontend.

MenuManager nace del conocimiento de necesidades reales del sector hostelero y explora cómo centralizar estas operaciones en una aplicación mantenible, separando la experiencia del cliente de las herramientas internas de administración.

## Funcionalidades

### Carta pública

- Visualización de platos agrupados en secciones jerárquicas.
- Búsqueda por nombre o descripción.
- Ordenación por precio.
- Exclusión de platos que contienen determinados alérgenos.
- Cambio de idioma entre español e inglés.
- Ocultación automática de platos no disponibles.
- Estados diferenciados de carga, error y ausencia de resultados.
- Diseño adaptable a diferentes tamaños de pantalla.

### Panel de administración

- Inicio y cierre de sesión mediante Supabase Auth.
- Protección de rutas para usuarios autenticados.
- Autorización específica para usuarios con rol de administrador.
- Búsqueda, filtrado y ordenación de platos.
- Actualización de la disponibilidad de cada plato.
- Modificación de precios.
- Actualizaciones optimistas para proporcionar respuesta inmediata en la interfaz.
- Restauración del estado anterior cuando una actualización no puede persistirse.
- Notificación visual de errores durante el guardado.

## Decisiones técnicas

### Estado con Angular Signals

Cada funcionalidad mantiene su estado mediante servicios que exponen Signals de solo lectura.

Los valores derivados —como los platos visibles, los filtros aplicados o la estructura jerárquica de la carta— se calculan con `computed`, evitando almacenar información duplicada y manteniendo una única fuente de verdad.

Para el alcance actual del proyecto, este enfoque proporciona un estado predecible sin introducir una librería externa de gestión de estado.

### Separación entre datos y aplicación

Las respuestas de Supabase no se utilizan directamente en los componentes.

Los clientes de datos realizan las consultas y los mapeadores convierten las respuestas externas en modelos propios de la aplicación:

```text
Supabase → cliente de datos → mapper → modelo de aplicación → store → interfaz
```

Esta separación reduce el acoplamiento entre la base de datos y la interfaz, facilita el tipado y permite modificar cada parte de forma independiente.

### Organización por funcionalidades

El código está organizado alrededor de funcionalidades de negocio —carta, administración y autenticación— en lugar de agrupar globalmente todos los componentes o servicios por tipo técnico.

Cada funcionalidad puede contener:

- `data`: acceso a datos, mapeadores y estado;
- `feature`: páginas conectadas al router;
- `ui`: componentes de presentación;
- `util`: modelos y transformaciones puras;
- `api.ts`: API pública de la funcionalidad.

### Actualizaciones optimistas

Al modificar el precio o la disponibilidad de un plato, el estado local se actualiza inmediatamente.

Si Supabase rechaza la operación, el store restaura el valor anterior y la interfaz informa del error. De esta forma se consigue una experiencia rápida sin ignorar posibles fallos de persistencia.

### Precios representados en céntimos

Los precios se almacenan como números enteros en céntimos para evitar errores de precisión asociados a las operaciones con números decimales.

La conversión a euros se realiza únicamente en los límites de presentación y entrada de datos.

### Autenticación y autorización separadas

El acceso al panel utiliza dos guards con responsabilidades diferentes:

- `authGuard` comprueba que exista una sesión válida;
- `adminGuard` verifica que el usuario autenticado tenga permisos de administrador.

Separar ambas comprobaciones permite expresar con claridad la diferencia entre identidad y permisos.

### Carga diferida de funcionalidades

Las áreas de carta, autenticación y administración se cargan mediante rutas lazy-loaded. Esto mantiene separadas las funcionalidades principales y evita incluir código administrativo en la carga inicial de la carta pública.

## Arquitectura

```text
src/app/
├── menu/
│   ├── data/       # Clientes de Supabase, mapeadores y estado
│   ├── feature/    # Página principal de la carta
│   ├── ui/         # Filtros, secciones y tarjetas de platos
│   ├── util/       # Modelos y transformaciones puras
│   └── api.ts      # API pública de la funcionalidad
│
├── admin/
│   ├── data/       # Acceso a datos y estado administrativo
│   ├── feature/    # Panel de administración
│   ├── ui/         # Filtros, filas y agrupaciones
│   ├── util/       # Búsqueda, ordenación y transformaciones
│   └── api.ts
│
├── auth/
│   ├── data/       # Acceso al perfil del usuario
│   ├── feature/    # Login, guards y páginas de autorización
│   └── api.ts
│
└── shared/
    ├── data/       # Supabase e internacionalización
    ├── util/       # Modelos compartidos
    └── api.ts
```

La intención no es reproducir una arquitectura compleja, sino mantener una separación suficiente entre acceso a datos, estado, lógica de transformación y presentación.

## Tecnologías

- Angular 19
- TypeScript
- Angular Signals
- Angular Router
- Reactive Forms
- Supabase Database
- Supabase Auth
- PrimeNG
- ngx-translate
- CSS
- pnpm

## Desarrollo local

### Requisitos

- Node.js compatible con Angular 19.
- pnpm.
- Un proyecto de Supabase.

### Instalación

```bash
git clone https://github.com/vCentDev/menu-manager.git
cd menu-manager
pnpm install
pnpm start
```

La aplicación estará disponible en:

```text
http://localhost:4200
```

### Configuración de Supabase

Configura la conexión en:

```text
src/environments/environment.development.ts
```

Utiliza la siguiente estructura:

```ts
export const environment = {
  production: false,
  supabase: {
    url: "TU_SUPABASE_URL",
    anonKey: "TU_SUPABASE_ANON_KEY",
  },
};
```

La aplicación trabaja con información relacionada con:

- platos;
- traducciones de platos;
- secciones;
- traducciones de secciones;
- alérgenos;
- traducciones de alérgenos;
- perfiles y roles de usuario.

La clave `anon` o `publishable` de Supabase puede utilizarse en el cliente, pero la seguridad debe garantizarse mediante políticas Row Level Security. Nunca debe exponerse una clave `service_role` en el frontend.

> El repositorio todavía no incluye migraciones ni datos iniciales para reproducir automáticamente la base de datos. Incorporarlos forma parte del roadmap del proyecto.

### Compilación de producción

```bash
pnpm build
```

Los archivos generados se guardarán en:

```text
dist/menu-manager
```

## Testing y calidad

La suite de pruebas automatizadas todavía está en desarrollo.

La estrategia prevista prioriza las partes con mayor lógica y riesgo:

- construcción del árbol jerárquico de secciones;
- búsqueda y normalización de texto;
- filtrado y ordenación;
- conversión y validación de precios;
- mapeo entre respuestas de Supabase y modelos de aplicación;
- estados derivados de los stores;
- rollback de actualizaciones optimistas;
- guards de autenticación y autorización;
- flujos críticos de carta, login y administración.

El objetivo es combinar pruebas unitarias sobre lógica pura con pruebas de integración de los stores y pruebas end-to-end para los recorridos principales.

## Estado actual

El proyecto permite actualmente:

- consultar la carta pública;
- buscar, ordenar y filtrar platos;
- cambiar entre español e inglés;
- iniciar sesión;
- proteger el panel mediante autenticación y roles;
- actualizar precios;
- modificar la disponibilidad de los platos.

La gestión completa de secciones y el resto de operaciones administrativas continúan en desarrollo.

## Roadmap

- [ ] Incorporar migraciones y datos iniciales de Supabase.
- [ ] Añadir una suite de pruebas unitarias.
- [ ] Probar los flujos críticos con tests end-to-end.
- [ ] Ejecutar build y tests mediante integración continua.
- [ ] Completar la gestión de secciones.
- [ ] Permitir crear y editar platos.
- [ ] Administrar traducciones y alérgenos.
- [ ] Mejorar la gestión y validación de imágenes.
- [ ] Realizar una auditoría de accesibilidad.
- [ ] Publicar una demostración con datos y permisos controlados.

## Principales aprendizajes

Este proyecto me ha permitido profundizar en:

- diseño de estado reactivo con Signals;
- separación entre modelos externos y modelos de aplicación;
- organización del código por funcionalidades;
- autenticación y autorización basada en roles;
- actualización optimista y recuperación ante errores;
- modelado de información multilingüe;
- transformación de datos jerárquicos;
- diseño de componentes con responsabilidades acotadas;
- manejo explícito de estados asíncronos;
- toma y justificación de decisiones técnicas.

## Autor

Desarrollado por [Vicente Marco](https://github.com/vCentDev), desarrollador Frontend especializado en Angular y TypeScript.
