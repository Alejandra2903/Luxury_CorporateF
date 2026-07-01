# Luxury Corporate Frontend

Luxury Corporate Frontend es una aplicacion web desarrollada con Angular para la gestion corporativa de recursos, costos, usuarios, roles, alertas, auditoria, sesiones y reportes ejecutivos.

El proyecto esta pensado como un avance academico de Desarrollo Web Integrado. Aplica conceptos vistos en clase como componentes, rutas, formularios reactivos, servicios, guards, interceptores, consumo de datos, estilos con SASS y manejo basico de autenticacion.

## Objetivo del proyecto

El objetivo de Luxury es centralizar informacion operativa y administrativa de una empresa, permitiendo que distintos roles consulten o gestionen datos segun sus permisos.

La aplicacion permite:

- Iniciar sesion con usuarios de prueba.
- Registrar nuevos usuarios con rol inicial de operador.
- Gestionar usuarios, roles y permisos desde el panel de administrador.
- Visualizar dashboards de costos, consumos y alertas.
- Registrar consumos de energia y agua.
- Gestionar reglas de negocio, tarifas, umbrales y alertas.
- Consultar auditorias y monitoreo de sesiones.
- Generar reportes mensuales en PDF.
- Alternar entre tema claro y oscuro.

## Tecnologias utilizadas

- Angular 19
- TypeScript
- Angular Router
- Formularios reactivos
- HttpClient
- Guards
- Interceptores
- RxJS
- SASS
- LocalStorage
- CSS custom properties para tema claro/oscuro

## Instalacion y ejecucion

### 1. Clonar el repositorio

```bash
git clone https://github.com/Alejandra2903/Luxury_CorporateF.git
cd Luxury_CorporateF
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Ejecutar el proyecto

```bash
npm start
```

Tambien se puede ejecutar con:

```bash
ng serve
```

La aplicacion se abrira normalmente en:

```txt
http://localhost:4200
```

### 4. Compilar el proyecto

```bash
npm run build
```

Para modo desarrollo:

```bash
npm run build -- --configuration development
```

## Credenciales de prueba

El proyecto trabaja con datos locales/mock para poder probar la aplicacion sin backend real.

| Rol | Usuario | Contrasena |
| --- | --- | --- |
| ADMIN | admin@luxury.pe | admin123 |
| GERENTE | gerente@luxury.pe | gerente123 |
| AUDITOR | auditor@luxury.pe | auditor123 |
| ANALISTA | analista@luxury.pe | analista123 |
| OPERADOR | operador@luxury.pe | operador123 |

## Roles del sistema

### ADMIN

Tiene acceso completo al sistema. Puede gestionar usuarios, roles, permisos, recursos, reportes, reglas, auditoria y monitoreo de sesiones.

### GERENTE

Puede revisar indicadores, dashboard, recursos, cambio financiero, reglas de negocio y reportes.

### AUDITOR

Puede revisar dashboard, auditoria y reportes. Su enfoque es la revision de actividad y trazabilidad.

### ANALISTA

Puede consultar dashboard, recursos y reportes para analizar informacion operativa.

### OPERADOR

Puede consultar recursos y registrar consumos operativos desde transacciones.

## Rutas principales

| Ruta | Descripcion | Roles |
| --- | --- | --- |
| `/login` | Inicio de sesion | Publico |
| `/registro` | Registro de nuevo usuario | Publico |
| `/panel` | Panel inicial segun rol | Todos los usuarios autenticados |
| `/dashboard` | Indicadores generales | ADMIN, GERENTE, AUDITOR, ANALISTA |
| `/resources` | Centro de recursos | ADMIN, GERENTE, ANALISTA, OPERADOR |
| `/resources/energy` | Consumo de energia | ADMIN, GERENTE, ANALISTA, OPERADOR |
| `/resources/water` | Consumo de agua | ADMIN, GERENTE, ANALISTA, OPERADOR |
| `/resources/transactions` | Registro y consulta de transacciones | ADMIN, GERENTE, ANALISTA, OPERADOR |
| `/financial-exchange` | Cambio financiero | ADMIN, GERENTE |
| `/business-rules` | Reglas, tarifas, umbrales y alertas | ADMIN, GERENTE |
| `/audit` | Auditoria | ADMIN, AUDITOR |
| `/reports` | Reportes ejecutivos | ADMIN, GERENTE, AUDITOR, ANALISTA |
| `/session-monitoring` | Monitoreo de sesiones | ADMIN |
| `/admin/users` | Administracion de usuarios | ADMIN |
| `/admin/roles` | Administracion de roles | ADMIN |
| `/admin/permissions` | Administracion de permisos | ADMIN |

## Modulos principales

### Autenticacion

Incluye login, registro, cierre de sesion, almacenamiento de token y recuperacion del usuario autenticado.

Archivos relacionados:

- `src/app/public/auth/login`
- `src/app/public/auth/register`
- `src/app/core/services/auth.service.ts`
- `src/app/core/services/token-storage.service.ts`

### Layout y navegacion

La aplicacion usa un layout principal con header superior, boton de tema, notificaciones para administrador, perfil de usuario y sidebar lateral.

Archivos relacionados:

- `src/app/user-app/app-layout`
- `src/app/admin-panel/admin-layout`
- `src/app/user-app/components/navigation`

### Administracion

Incluye gestion de usuarios, roles y permisos. Solo el administrador puede acceder a estas pantallas.

Archivos relacionados:

- `src/app/admin-panel/users`
- `src/app/admin-panel/roles`
- `src/app/admin-panel/permissions`

### Recursos y transacciones

Permite consultar sedes, tipos de recursos, consumos de energia, consumos de agua y transacciones. El operador puede registrar nuevos consumos.

Archivos relacionados:

- `src/app/user-app/domains/resources`
- `src/app/core/services/resources.service.ts`

### Dashboard

Muestra indicadores generales sobre costos, consumos, sedes y alertas.

Archivos relacionados:

- `src/app/user-app/domains/dashboard`
- `src/app/core/services/dashboard.service.ts`

### Reglas de negocio

Permite gestionar tarifas, umbrales y alertas operativas.

Archivos relacionados:

- `src/app/user-app/domains/business-rules`
- `src/app/core/services/business-rules.service.ts`

### Auditoria

Permite revisar eventos y acciones registradas dentro del sistema.

Archivos relacionados:

- `src/app/user-app/domains/audit`
- `src/app/core/services/audit.service.ts`

### Monitoreo de sesiones

Registra eventos de actividad del usuario como cambios de pestana, perdida de foco, retorno a la sesion, inactividad y acciones sensibles. La pantalla de monitoreo solo la ve ADMIN.

Archivos relacionados:

- `src/app/user-app/domains/session-monitoring`
- `src/app/core/services/session-monitoring.service.ts`

### Reportes

Permite consultar reportes mensuales y generar un PDF ejecutivo con resumen, KPIs, recursos, sedes y observacion ejecutiva.

Archivos relacionados:

- `src/app/user-app/domains/reports`
- `src/app/core/services/reports.service.ts`

## Estructura de carpetas

```txt
src/app/
  app.config.ts
  app.routes.ts
  app.ts

  core/
    guards/
    interceptors/
    mocks/
    models/
    services/

  public/
    auth/
      login/
      register/
    public-layout/
    public.routes.ts

  user-app/
    app-layout/
    components/
      navigation/
    domains/
      audit/
      business-rules/
      dashboard/
      financial-exchange/
      reports/
      resources/
      session-monitoring/
    pages/
      role-panel/
    user-app.routes.ts

  admin-panel/
    admin-layout/
    permissions/
    roles/
    users/
    admin-panel.routes.ts

  shared/
    components/
```

## Requerimientos funcionales

- El sistema debe permitir iniciar sesion.
- El sistema debe permitir registrar nuevos usuarios.
- El usuario registrado debe crearse inicialmente con rol OPERADOR.
- El administrador debe poder crear, editar, activar y desactivar usuarios.
- El administrador debe poder visualizar roles y permisos.
- El sistema debe mostrar opciones de navegacion segun el rol autenticado.
- El sistema debe proteger rutas mediante guards.
- El sistema debe permitir consultar dashboard e indicadores.
- El sistema debe permitir consultar recursos, energia, agua y transacciones.
- El operador debe poder registrar consumos.
- El gerente debe poder gestionar reglas de negocio.
- El administrador debe poder revisar sesiones.
- El sistema debe permitir consultar reportes.
- El sistema debe generar reporte mensual en PDF.
- El sistema debe permitir alternar tema claro y oscuro.
- El sistema debe persistir informacion local usando LocalStorage.

## Requerimientos no funcionales

- La interfaz debe ser clara, moderna y empresarial.
- La aplicacion debe estar organizada por componentes.
- Los estilos deben estar separados por componente usando SASS.
- Las rutas deben estar centralizadas y protegidas por rol.
- El codigo debe estar dividido en servicios, modelos, guards e interceptores.
- El sistema debe compilar correctamente con Angular CLI.
- El sistema debe poder ejecutarse localmente sin backend real mediante datos mock.
- El modo claro/oscuro debe mantener buena legibilidad.
- El proyecto debe evitar subir `node_modules`, `dist` y archivos temporales.

## Conceptos Angular aplicados

### Componentes

Cada pantalla o parte reutilizable de la interfaz esta construida como un componente Angular. Por ejemplo, el login, el dashboard, las tablas de consumo y las tarjetas KPI son componentes.

### Rutas

Las rutas permiten navegar entre pantallas sin recargar toda la pagina. El archivo principal de rutas es `src/app/app.routes.ts`.

### Servicios

Los servicios concentran la logica de datos. Por ejemplo, `UsersService` maneja usuarios y `ReportsService` maneja reportes.

### Guards

Los guards controlan si un usuario puede entrar a una ruta. El proyecto usa `authGuard` para validar sesion y `roleGuard` para validar permisos por rol.

### Interceptores

Los interceptores modifican o controlan peticiones HTTP. El proyecto usa un interceptor JWT para adjuntar el token y otro para manejar errores.

### Formularios reactivos

Se usan para login, registro, usuarios, reglas, transacciones y filtros. Permiten validar datos desde TypeScript.

### SASS

Cada componente tiene su propio archivo `.scss`, lo que permite mantener estilos ordenados y reutilizables.

## Datos mock y LocalStorage

El proyecto actualmente puede funcionar sin backend real. Para eso usa archivos mock y almacenamiento local.

Los mocks estan en:

```txt
src/app/core/mocks/
```

La informacion creada durante las pruebas se guarda en `localStorage`, por ejemplo:

- usuarios registrados
- cuentas locales
- consumos creados
- preferencias de tema
- eventos de sesion
- notificaciones internas

## Generacion de PDF

El reporte PDF se genera desde el frontend como un `Blob`. No se usa una libreria pesada adicional. El PDF incluye:

- encabezado institucional
- resumen general
- KPIs
- detalle por recurso
- evaluacion por sede
- observacion ejecutiva
- pie de documento

## Estado del proyecto

El proyecto compila correctamente con:

```bash
npm run build -- --configuration development
```

Tambien compila en produccion. Angular puede mostrar advertencias de presupuesto en algunos archivos SASS por el tamano de estilos, pero no bloquean la compilacion.
