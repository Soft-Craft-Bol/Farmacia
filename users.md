# Módulo de Gestión de Usuarios - Documentación Completa

## Modelo de Datos

### Modelos Principales

1. **User**: Almacena información de usuarios
   ```prisma
   model User {
     id        Int      @id @default(autoincrement())
     nombre    String
     apellido  String
     usuario   String   @unique
     email     String   @unique
     password  String
     ci        String   @unique
     item      String?
     profesion String?
     foto      String?
     roles     UserRole[]
     areas     UserArea[]
     resetToken      String?
     resetTokenExpiry DateTime?
   }
   ```

2. **Role**: Define roles del sistema
   ```prisma
   model Role {
     id        Int      @id @default(autoincrement())
     nombre    String   @unique
     permisos  RolePermission[]
     usuarios  UserRole[]
   }
   ```

3. **Permission**: Permisos del sistema
   ```prisma
   model Permission {
     id     Int      @id @default(autoincrement())
     nombre String   @unique
     roles  RolePermission[]
   }
   ```

4. **Area**: Áreas organizacionales
   ```prisma
   model Area {
     id      Int       @id @default(autoincrement())
     nombre  String    @unique
     usuarios UserArea[]
   }
   ```

### Modelos de Relación

1. **UserRole**: Asigna roles a usuarios
2. **RolePermission**: Asigna permisos a roles
3. **UserArea**: Asigna áreas a usuarios

## Endpoints de la API

### Autenticación (auth)

#### Registrar usuario
**POST** `/auth/register`  
**Content-Type:** `multipart/form-data`

**Body:**
```json
{
  "nombre": "string (requerido)",
  "apellido": "string (requerido)",
  "usuario": "string (requerido, único)",
  "email": "string (requerido, único)",
  "password": "string (requerido)",
  "ci": "string (requerido, único)",
  "profesion": "string (opcional)",
  "roles": "array de IDs de roles (requerido)",
  "areas": "array de IDs de áreas (requerido)",
  "foto": "file (opcional, imagen)"
}
```

**Respuesta exitosa (201):**
```json
{
  "id": 1,
  "nombre": "Juan",
  "email": "juan@example.com",
  "roles": ["Técnico", "Supervisor"],
  "areas": ["Laboratorio A", "Taller B"]
}
```

#### Iniciar sesión
**POST** `/auth/login`  
**Body:**
```json
{
  "email": "string (requerido)",
  "password": "string (requerido)"
}
```

**Respuesta exitosa (200):**
```json
{
  "token": "jwt.token.here",
  "id": 1,
  "nombreCompleto": "Juan Pérez",
  "roles": ["Técnico"],
  "foto": "https://ejemplo.com/foto.jpg"
}
```

#### Obtener perfil
**GET** `/auth/profile`  
**Headers:** `Authorization: Bearer <token>`

**Respuesta exitosa (200):**
```json
{
  "id": 1,
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@example.com",
  "roles": ["Técnico"],
  "areas": ["Laboratorio A"]
}
```

#### Recuperación de contraseña
**POST** `/auth/password/forgot`  
**Body:**
```json
{
  "email": "string (requerido)"
}
```

**POST** `/auth/password/reset/:token`  
**Body:**
```json
{
  "password": "string (nueva contraseña)"
}
```

### Gestión de Usuarios (users)

#### Obtener todos los usuarios
**GET** `/users/`

**Respuesta exitosa (200):**
```json
[
  {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@example.com",
    "roles": ["Técnico"]
  }
]
```

#### Obtener usuario por ID
**GET** `/users/:id`

**Respuesta exitosa (200):**
```json
{
  "id": 1,
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@example.com",
  "ci": "1234567",
  "profesion": "Ingeniero",
  "foto": "https://ejemplo.com/foto.jpg",
  "roles": ["Técnico"],
  "areas": ["Laboratorio A"]
}
```

#### Actualizar usuario
**PUT** `/users/:id`  
**Body:**
```json
{
  "nombre": "string (opcional)",
  "profesion": "string (opcional)",
  "areas": "array de IDs (opcional)"
}
```

#### Eliminar usuario
**DELETE** `/users/:id`

**Respuesta exitosa (200):**
```json
{
  "message": "Usuario eliminado correctamente",
  "id": 1
}
```

#### Obtener técnicos
**GET** `/users/tecnicos`

**Respuesta exitosa (200):**
```json
[
  {
    "id": 1,
    "nombreCompleto": "Juan Pérez",
    "especialidad": "Electrónica"
  }
]
```

### Gestión de Roles (auth/roles)

#### Obtener todos los roles
**GET** `/auth/roles`

**Respuesta exitosa (200):**
```json
[
  {
    "id": 1,
    "nombre": "Admin",
    "permisos": ["crear_usuario", "eliminar_usuario"]
  }
]
```

#### Crear rol
**POST** `/auth/roles`  
**Body:**
```json
{
  "nombre": "string (requerido)",
  "permisos": "array de IDs de permisos (requerido)"
}
```

#### Asignar rol a usuario
**POST** `/auth/roles/assign`  
**Body:**
```json
{
  "userId": "number (requerido)",
  "roleId": "number (requerido)"
}
```

### Gestión de Áreas (area)

#### Crear área
**POST** `/area/`  
**Body:**
```json
{
  "nombre": "string (requerido)"
}
```

#### Obtener áreas por usuario
**GET** `/area/user/:userId`

**Respuesta exitosa (200):**
```json
[
  {
    "id": 1,
    "nombre": "Laboratorio A"
  }
]
```

## Seguridad y Autenticación

- Todos los endpoints (excepto login/register) requieren token JWT
- Los tokens expiran en 1 hora
- Contraseñas almacenadas con bcrypt (hash + salt)
- Validación de roles y permisos para acciones críticas

## Variables de Entorno Requeridas

```
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=tu_secreto_jwt
EMAIL_SERVICE=gmail
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_password_email
EMAIL_FROM=no-reply@tudominio.com
FRONTEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=tu_cloud
CLOUDINARY_API_KEY=tu_key
CLOUDINARY_API_SECRET=tu_secret
```

## Diagrama de Relaciones

```
User ────┬──── Role
         │
         └──── Area
         
Role ──── Permission
```

## Consideraciones Importantes

1. **Validaciones**:
   - Campos únicos (email, CI, usuario)
   - Formato de email válido
   - Fortaleza de contraseñas
   - Existencia de roles/áreas al asignar

2. **Seguridad**:
   - Nevera de tokens JWT
   - CORS configurado
   - Protección contra inyección SQL (Prisma)

3. **Archivos**:
   - Imágenes de perfil opcionales
   - Almacenamiento en Cloudinary
   - Límite de tamaño: 5MB

4. **Flujos Especiales**:
   - Recuperación de contraseña con token temporal
   - Notificaciones por email
   - Asignación masiva de áreas/roles