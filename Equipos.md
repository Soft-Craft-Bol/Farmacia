# Sistema de Gestión de Equipos - Microservicio

Este microservicio forma parte de una arquitectura de microservicios y está completamente aislado de otros módulos. Proporciona funcionalidades completas para la gestión de equipos, incluyendo registro, seguimiento y mantenimiento.

## Características Implementadas

### Modelo de Datos
El sistema utiliza Prisma ORM con una base de datos PostgreSQL y contiene los siguientes modelos principales:

- **Equipo**: Almacena toda la información de los equipos
- **HistorialMantenimiento**: Registra los mantenimientos realizados
- **ComponenteEquipo**: Componentes asociados a cada equipo
- **ImagenEquipo**: Imágenes relacionadas con el equipo
- **DocumentoEquipo**: Documentos asociados al equipo

### Funcionalidades Principales

1. **Gestión Completa de Equipos**
   - Registro de nuevos equipos con todos sus datos
   - Actualización de información de equipos existentes
   - Eliminación de equipos
   - Consulta de equipos (individual, todos, por usuario)

2. **Gestión de Archivos Adjuntos**
   - Subida de hasta 4 imágenes por equipo
   - Subida de hasta 4 documentos por equipo
   - Almacenamiento local de archivos en `/uploads/images` y `/uploads/documents`

3. **Componentes de Equipos**
   - Asociación de múltiples componentes a cada equipo
   - Gestión completa de componentes (creación, actualización, eliminación)

4. **Sistema de Mantenimiento**
   - Registro de historial de mantenimientos
   - Cálculo automático de próximo mantenimiento basado en intervalo
   - Seguimiento de horas de uso acumuladas

## API Endpoints

## Endpoints de Equipos

### 1. Registrar un nuevo equipo
**Método:** POST  
**Endpoint:** `/equipos/`  
**Content-Type:** `multipart/form-data`

#### Campos obligatorios en el body:
```json
{
  "etiquetaActivo": "string (único)",
  "numeroSerie": "string (único)",
  "modelo": "string",
  "estado": "string",
  "ubicacion": "string",
  "tipoMantenimiento": "string",
  "usuarioId": "number"
}
```

#### Campos opcionales:
```json
{
  "fechaCompra": "ISO8601 date",
  "proveedor": "string",
  "numeroOrden": "string",
  "componentes": "JSON string array" // Ej: '["componente1", "componente2"]'
}
```

#### Archivos (opcionales):
- `imagenes[]`: Hasta 4 archivos de imagen (max 5MB cada uno)
- `documentos[]`: Hasta 4 archivos de documentos (max 5MB cada uno)

#### Respuesta exitosa (201 Created):
```json
{
  "id": 1,
  "etiquetaActivo": "EQ-001",
  "numeroSerie": "SN123456",
  "modelo": "Modelo X",
  "estado": "Operativo",
  "ubicacion": "Laboratorio A",
  "tipoMantenimiento": "Preventivo",
  "fechaCompra": "2023-01-15T00:00:00.000Z",
  "proveedor": "Proveedor ABC",
  "numeroOrden": "ORD-123",
  "componentes": [
    {"id": 1, "nombre": "Batería", "equipoId": 1},
    {"id": 2, "nombre": "Pantalla", "equipoId": 1}
  ],
  "imagenes": [
    {"url": "/uploads/images/123456-image1.jpg", "file": "image1.jpg", "isExisting": false}
  ],
  "documentos": [
    {"name": "manual.pdf", "file": "789012-manual.pdf", "type": "application/pdf", "isExisting": false}
  ]
}
```

### 2. Obtener todos los equipos
**Método:** GET  
**Endpoint:** `/equipos/`

#### Parámetros de consulta (opcionales):
- `estado`: Filtrar por estado
- `ubicacion`: Filtrar por ubicación
- `tipoMantenimiento`: Filtrar por tipo de mantenimiento

#### Respuesta exitosa (200 OK):
```json
[
  {
    "id": 1,
    "etiquetaActivo": "EQ-001",
    "numeroSerie": "SN123456",
    "modelo": "Modelo X",
    "estado": "Operativo",
    "ubicacion": "Laboratorio A",
    "tipoMantenimiento": "Preventivo",
    "componentes": [
      {"id": 1, "nombre": "Batería"},
      {"id": 2, "nombre": "Pantalla"}
    ]
  },
  {
    "id": 2,
    "etiquetaActivo": "EQ-002",
    "numeroSerie": "SN789012",
    "modelo": "Modelo Y",
    "estado": "En mantenimiento",
    "ubicacion": "Laboratorio B",
    "tipoMantenimiento": "Correctivo",
    "componentes": [
      {"id": 3, "nombre": "Teclado"}
    ]
  }
]
```

### 3. Obtener equipo por ID
**Método:** GET  
**Endpoint:** `/equipos/:id`

#### Respuesta exitosa (200 OK):
```json
{
  "id": 1,
  "etiquetaActivo": "EQ-001",
  "numeroSerie": "SN123456",
  "modelo": "Modelo X",
  "estado": "Operativo",
  "ubicacion": "Laboratorio A",
  "tipoMantenimiento": "Preventivo",
  "fechaCompra": "2023-01-15T00:00:00.000Z",
  "proveedor": "Proveedor ABC",
  "numeroOrden": "ORD-123",
  "fotoUrl1": "/uploads/images/123456-image1.jpg",
  "documentoUrl1": "/uploads/documents/789012-manual.pdf",
  "componentes": [
    {"id": 1, "nombre": "Batería", "equipoId": 1},
    {"id": 2, "nombre": "Pantalla", "equipoId": 1}
  ],
  "imagenes": [
    {"id": 1, "url": "/uploads/images/123456-image1.jpg", "file": "image1.jpg", "isExisting": false}
  ],
  "documentos": [
    {"id": 1, "name": "manual.pdf", "file": "789012-manual.pdf", "type": "application/pdf", "isExisting": false}
  ],
  "historialMantenimientos": [
    {
      "id": 1,
      "fechaInicio": "2023-06-01T00:00:00.000Z",
      "fechaFin": "2023-06-02T00:00:00.000Z",
      "tipo": "Preventivo",
      "descripcion": "Mantenimiento rutinario",
      "horasUso": 500,
      "tecnicoNombre": "Juan Pérez"
    }
  ]
}
```

### 4. Obtener equipos por ID de usuario
**Método:** GET  
**Endpoint:** `/equipos/user/:userId`

#### Respuesta exitosa (200 OK):
```json
[
  {
    "id": 1,
    "etiquetaActivo": "EQ-001",
    "numeroSerie": "SN123456",
    "modelo": "Modelo X",
    "estado": "Operativo",
    "ubicacion": "Laboratorio A",
    "tipoMantenimiento": "Preventivo",
    "componentes": [
      {"id": 1, "nombre": "Batería"},
      {"id": 2, "nombre": "Pantalla"}
    ],
    "imagenes": [
      {"url": "/uploads/images/123456-image1.jpg"}
    ]
  }
]
```

### 5. Actualizar equipo existente
**Método:** PUT  
**Endpoint:** `/equipos/:id`  
**Content-Type:** `multipart/form-data`

#### Campos en el body (todos opcionales excepto ID):
```json
{
  "etiquetaActivo": "string",
  "numeroSerie": "string",
  "modelo": "string",
  "estado": "string",
  "ubicacion": "string",
  "tipoMantenimiento": "string",
  "fechaCompra": "ISO8601 date",
  "proveedor": "string",
  "numeroOrden": "string",
  "usuarioId": "number",
  "componentes": "JSON string array" // Reemplaza todos los componentes existentes
}
```

#### Archivos (opcionales):
- `imagenes[]`: Hasta 4 archivos (reemplazan las existentes)
- `documentos[]`: Hasta 4 archivos (reemplazan los existentes)

#### Respuesta exitosa (200 OK):
```json
{
  "id": 1,
  "etiquetaActivo": "EQ-001",
  "numeroSerie": "SN123456",
  "modelo": "Modelo X Actualizado",
  "estado": "En mantenimiento",
  "ubicacion": "Laboratorio B",
  "tipoMantenimiento": "Preventivo",
  "componentes": [
    {"id": 3, "nombre": "Nuevo componente", "equipoId": 1}
  ],
  "imagenes": [
    {"url": "/uploads/images/654321-newimage.jpg", "file": "newimage.jpg", "isExisting": false}
  ],
  "documentos": [
    {"name": "nuevo_doc.pdf", "file": "654321-nuevo_doc.pdf", "type": "application/pdf", "isExisting": false}
  ]
}
```

### 6. Eliminar equipo
**Método:** DELETE  
**Endpoint:** `/equipos/:id`

#### Respuesta exitosa (200 OK):
```json
{
  "message": "Equipo eliminado correctamente",
  "deletedEquipo": {
    "id": 1,
    "etiquetaActivo": "EQ-001"
  }
}
```

## Errores comunes

#### 400 Bad Request (Validación)
```json
{
  "error": "Faltan campos obligatorios",
  "camposFaltantes": ["etiquetaActivo", "modelo"]
}
```

#### 404 Not Found (Equipo no existe)
```json
{
  "error": "Equipo no encontrado"
}
```

#### 409 Conflict (Etiqueta o número de serie duplicado)
```json
{
  "error": "La etiqueta de activo ya existe. Usa una diferente."
}
```

#### 500 Internal Server Error
```json
{
  "error": "Error al procesar la solicitud",
  "details": "Mensaje de error detallado (solo en desarrollo)"
}
```
## Configuración Técnica

- **Base de datos**: PostgreSQL
- **ORM**: Prisma
- **Gestión de archivos**: Multer para carga local
- **Tamaño máximo de archivos**: 5MB
- **Formatos soportados**:
  - Imágenes: Cualquier tipo MIME que comience con `image/`
  - Documentos: Cualquier tipo MIME que comience con `application/`

## Variables de Entorno

El proyecto requiere las siguientes variables de entorno:

- `DATABASE_URL`: URL de conexión a la base de datos PostgreSQL

## Estructura de Directorios

```
/src
  /config
    prisma.js       # Configuración de Prisma
  /controllers
    equipo.controller.js # Lógica de negocio
  /routes
    equipo.routes.js     # Definición de endpoints
  /uploads
    /images          # Imágenes subidas
    /documents       # Documentos subidos
```

## Próximas Mejoras (To-Do)

1. Implementar autenticación y autorización
2. Añadir endpoints específicos para gestión de mantenimientos
3. Implementar sistema de notificaciones para mantenimientos pendientes
4. Mejorar manejo de errores y validaciones
5. Añadir búsqueda y filtrado avanzado de equipos
6. Implementar paginación para listados grandes
7. Migrar almacenamiento de archivos a un servicio cloud (S3, Cloudinary, etc.)

## Requisitos del Sistema

- Node.js (v14+ recomendado)
- PostgreSQL (v12+ recomendado)
- Espacio en disco suficiente para almacenar archivos subidos (configurable)