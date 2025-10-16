# 👥 Módulo de Autenticación y Usuarios

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Endpoints Disponibles](#endpoints-disponibles)
4. [Sistema de Autenticación](#sistema-de-autenticación)
5. [Sistema de Autorización](#sistema-de-autorización)
6. [Roles del Sistema](#roles-del-sistema)
7. [Schemas de Validación](#schemas-de-validación)
8. [Ejemplos de Uso](#ejemplos-de-uso)
9. [Script de Usuario Administrador](#script-de-usuario-administrador)
10. [Integración con Otros Módulos](#integración-con-otros-módulos)

---

## 📖 Descripción General

El módulo de **Autenticación y Usuarios** proporciona todas las funcionalidades necesarias para la gestión de usuarios del sistema, incluyendo registro, login, autorización basada en roles y CRUD completo de usuarios.

### Características Principales

✅ Registro de usuarios (rol Cliente por defecto)  
✅ Login con JWT (incluye `id_usuario` y `nom_rol`)  
✅ Autenticación basada en tokens JWT  
✅ Autorización por roles (Cliente, Operador, Administrador)  
✅ CRUD completo de usuarios (solo Admin)  
✅ Borrado lógico (soft delete)  
✅ Auditoría completa  
✅ Validación de datos en todas las capas  
✅ Hashing seguro de contraseñas (bcrypt)  

---

## 🏗️ Arquitectura

El módulo sigue una arquitectura modular por capas:

```
modules/users/
├── controllers/          # Manejo de peticiones HTTP
│   ├── auth.controller.js
│   └── user.controller.js
├── services/            # Lógica de negocio
│   ├── auth.service.js
│   └── user.service.js
├── routes/              # Definición de endpoints
│   ├── auth.routes.js
│   └── user.routes.js
├── middlewares/         # Autenticación y autorización
│   └── auth.middleware.js
├── schemas/             # Validación de DTOs
│   ├── auth.schemas.js
│   └── user.schemas.js
└── index.js             # Exporta rutas del módulo
```

### Flujo de una Petición

```
HTTP Request
    ↓
Routes (aplica middlewares)
    ↓
Middlewares (auth, authorize)
    ↓
Controller (valida con schemas)
    ↓
Service (lógica de negocio)
    ↓
Database (PostgreSQL)
    ↓
Response
```

---

## 🔌 Endpoints Disponibles

### 🔓 Públicos (sin autenticación)

#### 1. POST `/api/auth/register`
Registra un nuevo usuario con rol "Cliente" por defecto.

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "password123",
  "nombre": "Juan Pérez",
  "telefono": "+54 9 11 1234-5678",  // opcional
  "dni": "12345678"                   // opcional
}
```

**Response (201):**
```json
{
  "ok": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id_usuario": 1,
      "email": "usuario@example.com",
      "nombre": "Juan Pérez",
      "telefono": "+54 9 11 1234-5678",
      "dni": "12345678",
      "rol": "Cliente",
      "esta_activo": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. POST `/api/auth/login`
Autentica un usuario y devuelve un JWT.

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "ok": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id_usuario": 1,
      "email": "usuario@example.com",
      "nombre": "Juan Pérez",
      "telefono": "+54 9 11 1234-5678",
      "dni": "12345678",
      "rol": "Cliente",
      "esta_activo": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 🔒 Protegidos (requieren autenticación)

#### 3. GET `/api/users/me`
Obtiene el perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "ok": true,
  "data": {
    "id_usuario": 1,
    "email": "usuario@example.com",
    "nombre": "Juan Pérez",
    "telefono": "+54 9 11 1234-5678",
    "dni": "12345678",
    "rol": "Cliente",
    "esta_activo": true,
    "fecha_creacion": "2024-10-16T10:00:00.000Z"
  }
}
```

**Acceso:** Cualquier usuario autenticado

---

### 🔐 Solo Administradores

#### 4. GET `/api/users`
Lista todos los usuarios con filtros opcionales.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Params (opcionales):**
- `rol`: Filtrar por rol (Cliente, Operador, Administrador)
- `esta_activo`: Filtrar por estado (true/false)
- `limit`: Límite de resultados (default: 100, max: 1000)
- `offset`: Desplazamiento para paginación (default: 0)

**Ejemplo:**
```
GET /api/users?rol=Cliente&esta_activo=true&limit=10&offset=0
```

**Response (200):**
```json
{
  "ok": true,
  "data": [
    {
      "id_usuario": 1,
      "email": "usuario@example.com",
      "nombre": "Juan Pérez",
      "telefono": "+54 9 11 1234-5678",
      "dni": "12345678",
      "rol": "Cliente",
      "esta_activo": true,
      "fecha_creacion": "2024-10-16T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

#### 5. POST `/api/users`
Crea un nuevo usuario (cualquier rol).

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "email": "operador@example.com",
  "password": "Operador123!",
  "nombre": "María García",
  "telefono": "+54 9 11 5555-5555",
  "dni": "22222222",
  "id_rol_usuario": 2
}
```

**Roles disponibles:**
- `1` = Cliente
- `2` = Operador
- `3` = Administrador

**Response (201):**
```json
{
  "ok": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "id_usuario": 2,
    "email": "operador@example.com",
    "nombre": "María García",
    "telefono": "+54 9 11 5555-5555",
    "dni": "22222222",
    "rol": "Operador",
    "esta_activo": true
  }
}
```

#### 6. PUT `/api/users/:id`
Actualiza un usuario existente.

**Headers:**
```
Authorization: Bearer <token>
```

**Body (todos los campos opcionales):**
```json
{
  "nombre": "Juan Pérez Actualizado",
  "telefono": "+54 9 11 9999-9999",
  "dni": "99999999",
  "email": "nuevo@email.com",
  "password": "NuevaPassword123!",
  "id_rol_usuario": 2,
  "esta_activo": false
}
```

**Response (200):**
```json
{
  "ok": true,
  "message": "Usuario actualizado exitosamente",
  "data": {
    "id_usuario": 1,
    "email": "nuevo@email.com",
    "nombre": "Juan Pérez Actualizado",
    "telefono": "+54 9 11 9999-9999",
    "dni": "99999999",
    "rol": "Operador",
    "esta_activo": false
  }
}
```

#### 7. DELETE `/api/users/:id`
Desactiva un usuario (borrado lógico).

**Headers:**
```
Authorization: Bearer <token>
```

**Ejemplo:**
```
DELETE /api/users/2
```

**Response (200):**
```json
{
  "ok": true,
  "message": "Usuario desactivado exitosamente"
}
```

**Nota:** El usuario no se elimina de la base de datos, solo se marca `esta_activo = false`.

---

## 🔐 Sistema de Autenticación

### JWT (JSON Web Token)

El sistema utiliza JWT para la autenticación. El token incluye:

```javascript
{
  "id_usuario": 1,
  "email": "usuario@example.com",
  "nom_rol": "Cliente",
  "iat": 1697041200,      // Issued at
  "exp": 1697646000       // Expiration (7 días)
}
```

### Configuración

Las claves se configuran en `.env`:

```bash
JWT_SECRET=tu-clave-secreta-super-segura
JWT_EXPIRES_IN=7d
```

### Uso del Token

Incluir en el header de cada petición protegida:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Seguridad

- ✅ Contraseñas hasheadas con **bcrypt** (10 rondas)
- ✅ Tokens con expiración configurable
- ✅ Validación del token en cada petición
- ✅ Verificación de usuario activo
- ✅ Validación de rol en tiempo real

---

## 🛡️ Sistema de Autorización

### Middlewares Disponibles

#### 1. `authenticate`
Verifica que el usuario esté autenticado (token válido).

```javascript
router.get("/mi-perfil", authenticate, getProfile);
```

#### 2. `authorize(...roles)`
Verifica que el usuario tenga uno de los roles permitidos.

```javascript
router.post("/reservas", authenticate, authorize("Operador", "Administrador"), createReserva);
```

#### 3. `requireAdmin`
Shortcut para solo Administradores.

```javascript
router.delete("/usuarios/:id", requireAdmin, deleteUser);
```

#### 4. `requireStaff`
Shortcut para Operadores o Administradores.

```javascript
router.put("/cabanas/:id", requireStaff, updateCabana);
```

#### 5. `requireAuth`
Alias de `authenticate` (cualquier usuario autenticado).

```javascript
router.get("/mi-perfil", requireAuth, getProfile);
```

### Uso en Otros Módulos

```javascript
// Importar middlewares
import { authenticate, authorize, requireAdmin, requireStaff } from "../users/middlewares/auth.middleware.js";

// Aplicar en rutas
router.get("/cabanas", authenticate, getCabanas);  // Cualquier autenticado
router.post("/cabanas", requireStaff, createCabana);  // Operador o Admin
router.delete("/cabanas/:id", requireAdmin, deleteCabana);  // Solo Admin
```

### Objeto `req.user`

Después de pasar por `authenticate`, el request tiene:

```javascript
req.user = {
  id_usuario: 1,
  email: "usuario@example.com",
  nombre: "Juan Pérez",
  nom_rol: "Cliente",
  esta_activo: true
}
```

Usar en controllers para validar permisos adicionales:

```javascript
export const getReservas = async (req, res) => {
  const { id_usuario, nom_rol } = req.user;
  
  if (nom_rol === "Cliente") {
    // Mostrar solo sus reservas
    const reservas = await getReservasByUser(id_usuario);
  } else {
    // Mostrar todas las reservas
    const reservas = await getAllReservas();
  }
  
  res.json({ ok: true, data: reservas });
};
```

---

## 🎭 Roles del Sistema

### Jerarquía

```
Administrador (3)
    ↓
Operador (2)
    ↓
Cliente (1)
```

### Permisos por Rol

| Acción | Cliente | Operador | Admin |
|--------|---------|----------|-------|
| **Autenticación** |
| Registrarse | ✅ | - | - |
| Login | ✅ | ✅ | ✅ |
| Ver su perfil | ✅ | ✅ | ✅ |
| **Usuarios** |
| Listar usuarios | ❌ | ❌ | ✅ |
| Crear usuarios | ❌ | ❌ | ✅ |
| Editar usuarios | ❌ | ❌ | ✅ |
| Desactivar usuarios | ❌ | ❌ | ✅ |
| **Reservas** (ejemplo) |
| Ver sus reservas | ✅ | ✅ | ✅ |
| Ver todas las reservas | ❌ | ✅ | ✅ |
| Crear reserva | ✅ | ✅ | ✅ |
| Editar su reserva | ✅ | ❌ | ❌ |
| Editar cualquier reserva | ❌ | ✅ | ✅ |
| **Cabañas** (ejemplo) |
| Ver cabañas activas | ✅ | ✅ | ✅ |
| Ver todas las cabañas | ❌ | ✅ | ✅ |
| Crear cabañas | ❌ | ❌ | ✅ |
| Editar estado | ❌ | ✅ | ✅ |
| Editar todo | ❌ | ❌ | ✅ |

### Obtener ID de Rol

```sql
-- En la base de datos
SELECT id_rol_usuario, nom_rol FROM rol_usuario;

-- Resultado:
-- 1 | Cliente
-- 2 | Operador
-- 3 | Administrador
```

---

## ✅ Schemas de Validación

### Registro (POST /auth/register)

```javascript
{
  email: "obligatorio, formato email",
  password: "obligatorio, mínimo 6 caracteres",
  nombre: "obligatorio, mínimo 2 caracteres",
  telefono: "opcional, máximo 50 caracteres",
  dni: "opcional, máximo 50 caracteres"
}
```

### Login (POST /auth/login)

```javascript
{
  email: "obligatorio",
  password: "obligatorio"
}
```

### Crear Usuario (POST /users)

```javascript
{
  email: "obligatorio, formato email, único",
  password: "obligatorio, mínimo 6 caracteres",
  nombre: "obligatorio, mínimo 2 caracteres",
  id_rol_usuario: "obligatorio, debe existir (1, 2 o 3)",
  telefono: "opcional, máximo 50 caracteres",
  dni: "opcional, máximo 50 caracteres"
}
```

### Actualizar Usuario (PUT /users/:id)

```javascript
{
  // Todos los campos son opcionales
  nombre: "mínimo 2 caracteres si se envía",
  telefono: "máximo 50 caracteres",
  dni: "máximo 50 caracteres",
  email: "formato email, único",
  password: "mínimo 6 caracteres",
  id_rol_usuario: "debe existir",
  esta_activo: "booleano"
}
```

### Listar Usuarios (GET /users)

```javascript
{
  rol: "opcional, uno de: Cliente, Operador, Administrador",
  esta_activo: "opcional, true o false",
  limit: "opcional, 1-1000, default 100",
  offset: "opcional, >= 0, default 0"
}
```

---

## 💻 Ejemplos de Uso

### 1. Registrar un Cliente

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cliente@example.com",
    "password": "password123",
    "nombre": "Juan Pérez",
    "telefono": "+54 9 11 1234-5678",
    "dni": "12345678"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cliente@example.com",
    "password": "password123"
  }'
```

Guardar el `token` del response.

### 3. Ver Mi Perfil

```bash
curl -X GET http://localhost:4000/api/users/me \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### 4. Listar Usuarios (como Admin)

```bash
curl -X GET "http://localhost:4000/api/users?rol=Cliente&limit=10" \
  -H "Authorization: Bearer TU_TOKEN_ADMIN"
```

### 5. Crear un Operador (como Admin)

```bash
curl -X POST http://localhost:4000/api/users \
  -H "Authorization: Bearer TU_TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "operador@kallmaresort.com",
    "password": "Operador123!",
    "nombre": "María García",
    "telefono": "+54 9 11 5555-5555",
    "dni": "22222222",
    "id_rol_usuario": 2
  }'
```

### 6. Actualizar Usuario (como Admin)

```bash
curl -X PUT http://localhost:4000/api/users/2 \
  -H "Authorization: Bearer TU_TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "María García Actualizada",
    "telefono": "+54 9 11 9999-9999"
  }'
```

### 7. Desactivar Usuario (como Admin)

```bash
curl -X DELETE http://localhost:4000/api/users/2 \
  -H "Authorization: Bearer TU_TOKEN_ADMIN"
```

---

## 🔧 Script de Usuario Administrador

### Crear el Primer Admin

Para comenzar a usar el sistema, necesitas crear un usuario administrador:

```bash
# Desde la raíz del proyecto
node backend/scripts/create-admin.js
```

**Credenciales por defecto:**
- Email: `admin@kallmaresort.com`
- Password: `Admin123!`

**Salida esperada:**

```
🚀 Iniciando creación de usuario Administrador...

✅ Usuario Administrador creado exitosamente!

📋 Detalles del usuario:
   ID:        1
   Email:     admin@kallmaresort.com
   Nombre:    Administrador del Sistema
   Teléfono:  +54 9 11 0000-0000
   DNI:       00000000
   Rol:       Administrador
   Activo:    true

🔑 Credenciales de acceso:
   Email:     admin@kallmaresort.com
   Password:  Admin123!

⚠️  IMPORTANTE: Cambia la contraseña después del primer login!
```

### Modificar el Script

Editar `backend/scripts/create-admin.js`:

```javascript
const adminData = {
  email: "tu-email@example.com",
  password: "TuPasswordSegura123!",
  nombre: "Tu Nombre",
  telefono: "+54 9 11 0000-0000",
  dni: "00000000",
};
```

### Verificaciones del Script

- ✅ Verifica si el email ya existe
- ✅ Valida que el rol "Administrador" exista
- ✅ Usa transacciones
- ✅ Hashea la contraseña
- ✅ Auditoría completa

---

## 🔗 Integración con Otros Módulos

### Importar Middlewares

```javascript
// En cualquier módulo (cabañas, reservas, etc.)
import { 
  authenticate, 
  authorize, 
  requireAdmin, 
  requireStaff 
} from "../users/middlewares/auth.middleware.js";
```

### Ejemplo: Módulo de Reservas

```javascript
// modules/reservas/routes/reserva.routes.js
import { Router } from "express";
import { authenticate, requireStaff } from "../../users/middlewares/auth.middleware.js";
import { getReservas, createReserva, updateReserva, deleteReserva } from "../controllers/reserva.controller.js";

const router = Router();

// Clientes ven solo sus reservas, Staff ve todas
router.get("/", authenticate, getReservas);

// Cualquier autenticado puede crear reserva
router.post("/", authenticate, createReserva);

// Validar propiedad en el controller
router.put("/:id", authenticate, updateReserva);

// Solo Staff puede cancelar cualquier reserva
router.delete("/:id", requireStaff, deleteReserva);

export default router;
```

### Validar Propiedad de Recursos

```javascript
// En el controller
export const updateReserva = async (req, res) => {
  const { id } = req.params;
  const { id_usuario, nom_rol } = req.user;
  
  const reserva = await getReservaById(id);
  
  // Los clientes solo pueden editar sus propias reservas
  if (nom_rol === "Cliente" && reserva.id_usuario_creacion !== id_usuario) {
    return res.status(403).json({
      ok: false,
      error: "No tienes permiso para editar esta reserva"
    });
  }
  
  // El staff puede editar cualquier reserva
  const result = await updateReservaService(id, req.body, id_usuario);
  res.json({ ok: true, data: result });
};
```

### Auditoría en Otros Módulos

Usar `req.user.id_usuario` para auditoría:

```javascript
// Al crear
await pool.query(
  `INSERT INTO reserva (..., id_usuario_creacion, fecha_creacion)
   VALUES (..., $1, NOW())`,
  [..., req.user.id_usuario]
);

// Al actualizar
await pool.query(
  `UPDATE reserva 
   SET ..., id_usuario_modific = $1, fecha_modific = NOW()
   WHERE id_reserva = $2`,
  [req.user.id_usuario, id]
);
```

---

## 🔍 Manejo de Errores

### Errores Comunes

#### 401 Unauthorized

```json
{
  "ok": false,
  "error": "Token no proporcionado. Formato esperado: 'Bearer <token>'"
}
```

```json
{
  "ok": false,
  "error": "Token expirado. Por favor, inicie sesión nuevamente."
}
```

```json
{
  "ok": false,
  "error": "Token inválido"
}
```

#### 403 Forbidden

```json
{
  "ok": false,
  "error": "Usuario inactivo. Contacte al administrador."
}
```

```json
{
  "ok": false,
  "error": "Acceso denegado. Se requiere uno de los siguientes roles: Administrador",
  "rolActual": "Cliente"
}
```

#### 400 Bad Request

```json
{
  "ok": false,
  "error": "Datos de entrada inválidos",
  "errors": [
    { "field": "email", "message": "Email es obligatorio" },
    { "field": "password", "message": "La contraseña debe tener al menos 6 caracteres" }
  ]
}
```

#### 409 Conflict

```json
{
  "ok": false,
  "error": "El email ya está registrado"
}
```

#### 404 Not Found

```json
{
  "ok": false,
  "error": "Usuario no encontrado"
}
```

---

## 📊 Base de Datos

### Tabla `usuario`

```sql
CREATE TABLE usuario (
  id_usuario SERIAL PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  telefono VARCHAR(50),
  dni VARCHAR(50),
  id_rol_usuario INTEGER NOT NULL REFERENCES rol_usuario(id_rol_usuario),
  esta_activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_modific TIMESTAMP,
  id_usuario_creacion INTEGER REFERENCES usuario(id_usuario),
  id_usuario_modific INTEGER REFERENCES usuario(id_usuario)
);
```

### Tabla `rol_usuario`

```sql
CREATE TABLE rol_usuario (
  id_rol_usuario SERIAL PRIMARY KEY,
  nom_rol VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO rol_usuario (nom_rol) VALUES 
  ('Cliente'),
  ('Operador'),
  ('Administrador');
```

---

## 🎯 Mejores Prácticas

### 1. Seguridad

- ✅ **Nunca** retornar la contraseña hasheada en responses
- ✅ Usar siempre HTTPS en producción
- ✅ Cambiar `JWT_SECRET` en producción
- ✅ Validar entrada en todas las capas
- ✅ Implementar rate limiting (futura mejora)

### 2. Tokens

- ✅ Almacenar en `localStorage` o `sessionStorage`
- ✅ Incluir en header `Authorization: Bearer <token>`
- ✅ Manejar expiración (redirigir a login)
- ✅ No almacenar información sensible en el token

### 3. Frontend

```javascript
// Decodificar token en el frontend
import jwt_decode from "jwt-decode";

const token = localStorage.getItem("token");
const user = jwt_decode(token);

console.log(user.nom_rol); // "Cliente", "Operador", "Administrador"

// Mostrar/ocultar elementos según rol
{user.nom_rol === "Administrador" && (
  <Link to="/admin/usuarios">Gestionar Usuarios</Link>
)}

// Proteger rutas
<ProtectedRoute allowedRoles={["Administrador"]}>
  <UsersManagement />
</ProtectedRoute>
```

### 4. Auditoría

- ✅ Siempre usar `id_usuario_creacion` al crear
- ✅ Siempre usar `id_usuario_modific` al actualizar
- ✅ Registrar `fecha_creacion` y `fecha_modific`
- ✅ Nunca eliminar datos (usar `esta_activo`)

---

## 🚀 Próximos Pasos

1. **Implementar rate limiting** para prevenir ataques de fuerza bruta
2. **Agregar refresh tokens** para mejorar seguridad
3. **Implementar recuperación de contraseña** vía email
4. **Agregar verificación de email** al registro
5. **Implementar 2FA** (autenticación de dos factores)
6. **Agregar logs de auditoría** en tabla separada

---

## 📚 Recursos Adicionales

- **JWT**: https://jwt.io/
- **bcrypt**: https://github.com/kelektiv/node.bcrypt.js
- **Express**: https://expressjs.com/
- **PostgreSQL**: https://www.postgresql.org/docs/

---

## ✅ Checklist de Implementación

- [x] ✅ Sistema de registro
- [x] ✅ Sistema de login con JWT
- [x] ✅ Middleware de autenticación
- [x] ✅ Middleware de autorización por roles
- [x] ✅ CRUD completo de usuarios
- [x] ✅ Validación en todas las capas
- [x] ✅ Hashing de contraseñas
- [x] ✅ Borrado lógico
- [x] ✅ Auditoría completa
- [x] ✅ Script para crear admin
- [x] ✅ Documentación completa

---

**El módulo de Autenticación y Usuarios está completo y listo para producción.** 🎉

**Desarrollado para:** Sistema de Gestión de Reservas - Kallma Resort  
**Versión:** 1.0.0  
**Última actualización:** Octubre 2024
