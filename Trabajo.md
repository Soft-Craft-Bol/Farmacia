# Módulo de Gestión de Trabajos - Documentación Completa

## Modelo de Datos

El módulo de trabajos utiliza los siguientes modelos principales:

### 1. Trabajo
- Almacena la información principal de cada trabajo
- Campos principales: nombre, descripción, fechas, estado, prioridad, área, equipo asociado
- Relaciones: equipos, asignaciones, historial

### 2. TrabajoAsignacion
- Registra las asignaciones de técnicos a trabajos
- Incluye fechas de asignación, inicio y fin
- Relación muchos a uno con Trabajo

### 3. HistorialTrabajo
- Registra todos los cambios de estado de un trabajo
- Incluye usuario que realizó el cambio y comentario
- Relación muchos a uno con Trabajo

### 4. TrabajoEquipo
- Asociación de usuarios/equipos a trabajos
- Permite definir roles (admin/regular)

### Enumeraciones
- `EstadoTrabajo`: Pendiente, Aceptado, EnProgreso, Rechazado, Finalizado, Cancelado
- `Prioridad`: Baja, Media, Alta, Urgente

## Endpoints de la API

### 1. Gestión Básica de Trabajos

#### Crear un nuevo trabajo
**POST** `/trabajos/`  
**Content-Type:** `multipart/form-data`

**Body:**
```json
{
  "nombre": "string (requerido)",
  "descripcion": "string (opcional)",
  "fechaInicio": "ISO8601 date (requerido)",
  "equipoId": "number (opcional)",
  "area": "string (opcional)",
  "encargadoId": "number (opcional)",
  "tipoEquipo": "string (opcional)",
  "estado": "string (opcional, default: 'Pendiente')",
  "imagen": "file (opcional, max 5MB)"
}
```

**Respuesta exitosa (201):**
```json
{
  "message": "Trabajo creado con éxito",
  "data": {
    "id": 1,
    "nombre": "Reparación equipo X",
    "descripcion": "Descripción detallada",
    "fechaInicio": "2023-01-15T00:00:00.000Z",
    "estado": "Pendiente",
    "imagenes": "https://cloudinary.com/example.jpg",
    "equipoId": 5,
    "area": "Laboratorio A"
  }
}
```

#### Obtener todos los trabajos
**GET** `/trabajos/`  
**Query Params (opcionales):**
- `estado`: Filtrar por estado
- `area`: Filtrar por área
- `prioridad`: Filtrar por prioridad

**Respuesta exitosa (200):**
```json
[
  {
    "id": 1,
    "nombre": "Reparación equipo X",
    "estado": "Pendiente",
    "prioridad": "Alta",
    "fechaInicio": "2023-01-15T00:00:00.000Z",
    "equipos": []
  }
]
```

#### Obtener trabajo por ID
**GET** `/trabajos/:trabajoId`

**Respuesta exitosa (200):**
```json
{
  "id": 1,
  "nombre": "Reparación equipo X",
  "descripcion": "Descripción detallada",
  "estado": "Pendiente",
  "prioridad": "Alta",
  "fechaInicio": "2023-01-15T00:00:00.000Z",
  "fechaFin": null,
  "imagenes": "https://cloudinary.com/example.jpg",
  "equipos": [
    {"userId": "user1", "isAdmin": true}
  ],
  "historial": [
    {
      "estado": "Pendiente",
      "fechaCambio": "2023-01-10T10:00:00.000Z",
      "usuarioNombre": "Admin User"
    }
  ]
}
```

#### Actualizar trabajo
**PUT** `/trabajos/:trabajoId`  
**Body:**
```json
{
  "nombre": "string (opcional)",
  "descripcion": "string (opcional)",
  "fechaInicio": "ISO8601 date (opcional)",
  "fechaFin": "ISO8601 date (opcional)",
  "estado": "string (opcional)",
  "prioridad": "string (opcional)"
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Trabajo actualizado correctamente",
  "data": {
    "id": 1,
    "nombre": "Nombre actualizado"
  }
}
```

#### Eliminar trabajo
**DELETE** `/trabajos/:trabajoId`

**Respuesta exitosa (200):**
```json
{
  "message": "Trabajo eliminado correctamente",
  "deletedId": 1
}
```

### 2. Gestión de Estados

#### Actualizar estado específico
**PATCH** `/trabajos/:trabajoId/estado`  
**Body:**
```json
{
  "estado": "string (requerido)"
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Estado actualizado correctamente",
  "newEstado": "En Progreso"
}
```

#### Aceptar trabajo (flujo específico)
**PUT** `/trabajos/:trabajoId/aceptar`  
**Body:**
```json
{
  "tecnicoId": "number (requerido)",
  "fechaInicio": "ISO8601 date (requerido)",
  "fechaFin": "ISO8601 date (opcional)",
  "descripcion": "string (opcional)"
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Trabajo aceptado y asignado correctamente",
  "data": {
    "trabajo": {
      "id": 1,
      "estado": "Aceptado",
      "encargadoId": 5
    },
    "asignacion": {
      "tecnicoId": 5,
      "fechaInicio": "2023-01-20T00:00:00.000Z"
    }
  }
}
```

#### Rechazar trabajo
**PUT** `/trabajos/:trabajoId/rechazar`  
**Body:**
```json
{
  "motivo": "string (requerido)"
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Trabajo rechazado correctamente",
  "data": {
    "id": 1,
    "estado": "Rechazado"
  }
}
```

### 3. Gestión de Equipos/Usuarios

#### Añadir usuarios a un trabajo
**POST** `/trabajos/:trabajoId/equipos`  
**Body:**
```json
{
  "users": [
    {"userId": "string", "isAdmin": "boolean"},
    {"userId": "string2", "isAdmin": "false"}
  ]
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Usuarios asignados correctamente",
  "count": 2
}
```

#### Eliminar usuario de un trabajo
**DELETE** `/trabajos/:trabajoId/equipos/:userId`

**Respuesta exitosa (200):**
```json
{
  "message": "Usuario eliminado del trabajo correctamente",
  "userId": "user1"
}
```

## Manejo de Errores

### Errores comunes
- **400 Bad Request**: Validación fallida
- **404 Not Found**: Recurso no encontrado
- **409 Conflict**: Intento de duplicar datos únicos
- **500 Internal Server Error**: Error del servidor

**Ejemplo de respuesta de error:**
```json
{
  "error": "Estado inválido",
  "estadosValidos": ["Pendiente", "Aceptado", "En Progreso", "Finalizado", "Cancelado"],
  "details": "El estado proporcionado no es válido"
}
```

## Configuración Técnica

- **Base de datos**: PostgreSQL
- **ORM**: Prisma
- **Gestión de archivos**: Cloudinary (o almacenamiento local)
- **Tamaño máximo de archivos**: 5MB
- **Formatos soportados**: Imágenes (JPEG, PNG, etc.)

## Variables de Entorno Requeridas

```
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Diagrama de Estados del Trabajo

```
Pendiente → Aceptado → En Progreso → Finalizado
    ↓           ↓           ↓
    └──→ Rechazado    └──→ Cancelado
```

## Consideraciones de Seguridad

- Validación de estados y transiciones
- Control de acceso a endpoints sensibles
- Protección contra inyección SQL (Prisma)
- Validación de tipos de archivo y tamaños