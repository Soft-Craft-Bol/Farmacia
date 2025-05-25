# Resumen General de Endpoints - Sistema de Gestión

## Módulo 1: Gestión de Equipos

### Endpoints principales:
- **POST /equipos** - Registrar nuevo equipo con imágenes/documentos
- **GET /equipos** - Listar todos los equipos con sus componentes
- **GET /equipos/:id** - Obtener detalles completos de un equipo específico
- **PUT /equipos/:id** - Actualizar información de equipo existente
- **DELETE /equipos/:id** - Eliminar un equipo del sistema
- **GET /equipos/user/:userId** - Obtener equipos asignados a un usuario

*Gestiona el ciclo de vida completo de equipos, incluyendo mantenimientos, componentes y documentación asociada.*

---

## Módulo 2: Gestión de Trabajos

### Endpoints principales:
- **POST /trabajos** - Crear nueva orden de trabajo
- **GET /trabajos** - Listar todos los trabajos
- **GET /trabajos/:id** - Ver detalles de un trabajo específico
- **PUT /trabajos/:id/aceptar** - Aceptar y asignar un trabajo a técnico
- **PUT /trabajos/:id/rechazar** - Rechazar un trabajo con motivo
- **PATCH /trabajos/:id/estado** - Cambiar estado del trabajo (En Progreso/Finalizado)
- **POST /trabajos/:id/equipos** - Asignar usuarios/equipos a un trabajo

*Controla el flujo completo de órdenes de trabajo desde creación hasta finalización, con gestión de estados y asignaciones.*

---

## Módulo 3: Gestión de Usuarios y Permisos

### Endpoints principales:
#### Autenticación:
- **POST /auth/register** - Registrar nuevo usuario con roles/áreas
- **POST /auth/login** - Iniciar sesión y obtener token JWT
- **GET /auth/profile** - Obtener perfil del usuario autenticado

#### Usuarios:
- **GET /users** - Listar todos los usuarios
- **GET /users/tecnicos** - Obtener listado de técnicos
- **GET /users/:id** - Ver detalles de usuario específico

#### Roles/Permisos:
- **GET /auth/roles** - Listar roles con sus permisos
- **POST /auth/roles** - Crear nuevo rol con permisos
- **POST /auth/roles/assign** - Asignar rol a usuario

#### Áreas:
- **POST /area/** - Crear nueva área organizacional
- **GET /area/user/:userId** - Obtener áreas asignadas a usuario

*Administra identidades, acceso y estructura organizacional del sistema con control granular de permisos.*

---
Este sistema modular permite gestionar completamente equipos técnicos, órdenes de trabajo y usuarios con sus permisos en una arquitectura de microservicios.