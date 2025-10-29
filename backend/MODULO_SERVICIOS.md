# 🎯 MÓDULO DE SERVICIOS - Kallma Resort

## 📋 Tabla de Contenidos
1. [Descripción General](#descripción-general)
2. [Modelo de Datos](#modelo-de-datos)
3. [Endpoints Implementados](#endpoints-implementados)
4. [Reglas de Negocio](#reglas-de-negocio)
5. [Validaciones](#validaciones)
6. [Seguridad y Autorización](#seguridad-y-autorización)
7. [Integración con Reservas](#integración-con-reservas)
8. [Estructura del Código](#estructura-del-código)

---

## 📖 Descripción General

El **Módulo de Servicios** gestiona los servicios adicionales que el resort ofrece a sus clientes (Gimnasio, SPA, Restaurante, etc.). Estos servicios pueden ser agregados a las reservas de cabañas.

### Características Principales

- ✅ **Listado público**: Sin autenticación para el flujo del cliente
- ✅ **CRUD completo**: Para administradores
- ✅ **Validación de integridad**: No permite eliminar servicios con reservas activas
- ✅ **Información estadística**: Muestra cantidad de reservas por servicio
- ✅ **Nombres únicos**: Case-insensitive
- ✅ **Eliminación física**: No hay borrado lógico (tabla sin campo `esta_activo`)

---

## 🗃️ Modelo de Datos

### Tabla: `servicios`

```sql
CREATE TABLE IF NOT EXISTS servicios (
  id_servicio     SERIAL PRIMARY KEY,
  nom_servicio    VARCHAR(200) NOT NULL UNIQUE,
  precio_servicio NUMERIC(10,2) NOT NULL CHECK (precio_servicio >= 0)
);
```

### Tabla Relacional: `servicio_reserva`

```sql
CREATE TABLE IF NOT EXISTS servicio_reserva (
  id_serv_res SERIAL PRIMARY KEY,
  id_reserva  INTEGER NOT NULL REFERENCES reserva(id_reserva) ON DELETE RESTRICT ON UPDATE CASCADE,
  id_servicio INTEGER NOT NULL REFERENCES servicios(id_servicio) ON DELETE RESTRICT ON UPDATE CASCADE,
  UNIQUE (id_reserva, id_servicio)
);
```

### Servicios Precargados

```sql
INSERT INTO servicios (nom_servicio, precio_servicio) VALUES
  ('Gimnasio', 15000.00),
  ('SPA', 30000.00),
  ('Restaurante', 45000.00)
ON CONFLICT (nom_servicio) DO NOTHING;
```

**Nota**: El precio es **POR PERSONA POR NOCHE** según el modelo de negocio.

---

## 📡 Endpoints Implementados

### Resumen de Endpoints

| # | Método | Endpoint | Descripción | Autorización |
|---|--------|----------|-------------|--------------|
| 1 | GET | `/api/servicios` | Listar servicios | **Público** |
| 2 | GET | `/api/servicios/:id` | Detalle de servicio | Operador/Admin |
| 3 | POST | `/api/servicios` | Crear servicio | Admin |
| 4 | PATCH | `/api/servicios/:id` | Actualizar servicio | Admin |
| 5 | DELETE | `/api/servicios/:id` | Eliminar servicio | Admin |

---

### 1. GET `/api/servicios` - Listar Servicios

**Descripción**: Obtiene todos los servicios disponibles. Endpoint PÚBLICO para el flujo del cliente.

**Autorización**: ❌ No requiere autenticación

**Query Parameters**: Ninguno

**Respuesta Exitosa (200)**:
```json
{
  "ok": true,
  "data": [
    {
      "id_servicio": 1,
      "nom_servicio": "Gimnasio",
      "precio_servicio": "15000.00"
    },
    {
      "id_servicio": 2,
      "nom_servicio": "SPA",
      "precio_servicio": "30000.00"
    }
  ],
  "total": 2
}
```

**Ordenamiento**: Por `nom_servicio` ASC

---

### 2. GET `/api/servicios/:id` - Detalle de Servicio

**Descripción**: Obtiene información detallada de un servicio, incluyendo estadísticas de uso.

**Autorización**: ✅ Operador / Admin

**Headers**:
```
Authorization: Bearer <token>
```

**Respuesta Exitosa (200)**:
```json
{
  "ok": true,
  "data": {
    "id_servicio": 1,
    "nom_servicio": "Gimnasio",
    "precio_servicio": "15000.00",
    "total_reservas": "5"
  }
}
```

**Errores**:
- `400`: ID inválido
- `404`: Servicio no encontrado

---

### 3. POST `/api/servicios` - Crear Servicio

**Descripción**: Crea un nuevo servicio.

**Autorización**: ✅ Solo Admin

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body**:
```json
{
  "nom_servicio": "Piscina Climatizada",
  "precio_servicio": 20000
}
```

**Validaciones**:
- `nom_servicio`: Obligatorio, string, máx 200 caracteres, único
- `precio_servicio`: Obligatorio, número >= 0

**Respuesta Exitosa (201)**:
```json
{
  "ok": true,
  "message": "Servicio creado exitosamente",
  "data": {
    "id_servicio": 4,
    "nom_servicio": "Piscina Climatizada",
    "precio_servicio": "20000.00"
  }
}
```

**Errores**:
- `400`: Validación fallida
- `409`: Ya existe un servicio con ese nombre

---

### 4. PATCH `/api/servicios/:id` - Actualizar Servicio

**Descripción**: Actualiza un servicio existente.

**Autorización**: ✅ Solo Admin

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body** (todos los campos opcionales):
```json
{
  "nom_servicio": "Gimnasio Premium",
  "precio_servicio": 18000
}
```

**Validaciones**:
- Al menos un campo debe ser enviado
- Los campos enviados deben ser válidos
- El nombre no puede duplicarse con otros servicios

**Respuesta Exitosa (200)**:
```json
{
  "ok": true,
  "message": "Servicio actualizado exitosamente",
  "data": {
    "id_servicio": 1,
    "nom_servicio": "Gimnasio Premium",
    "precio_servicio": "18000.00"
  }
}
```

**Errores**:
- `400`: ID inválido o validación fallida
- `404`: Servicio no encontrado
- `409`: Nombre duplicado

---

### 5. DELETE `/api/servicios/:id` - Eliminar Servicio

**Descripción**: Elimina un servicio (eliminación física). Solo si no tiene reservas asociadas.

**Autorización**: ✅ Solo Admin

**Headers**:
```
Authorization: Bearer <token>
```

**Validaciones**:
- El servicio no debe tener registros en `servicio_reserva`

**Respuesta Exitosa (200)**:
```json
{
  "ok": true,
  "message": "Servicio eliminado exitosamente",
  "data": {
    "id_servicio": 4,
    "nom_servicio": "Piscina Climatizada",
    "precio_servicio": "20000.00"
  }
}
```

**Errores**:
- `400`: ID inválido o tiene reservas asociadas
- `404`: Servicio no encontrado

---

## 🔐 Seguridad y Autorización

### Niveles de Acceso

| Endpoint | Público | Cliente | Operador | Admin |
|----------|---------|---------|----------|-------|
| `GET /api/servicios` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/servicios/:id` | ❌ | ❌ | ✅ | ✅ |
| `POST /api/servicios` | ❌ | ❌ | ❌ | ✅ |
| `PATCH /api/servicios/:id` | ❌ | ❌ | ❌ | ✅ |
| `DELETE /api/servicios/:id` | ❌ | ❌ | ❌ | ✅ |

### Middlewares Utilizados

```javascript
import {
  authenticate,
  requireStaff,
  requireAdmin,
} from "../../users/middlewares/auth.middleware.js";
```

- **`authenticate`**: Valida token JWT
- **`requireStaff`**: Requiere rol Operador o Admin
- **`requireAdmin`**: Requiere rol Admin

---

## ✅ Reglas de Negocio

### Nombres Únicos
- Los nombres de servicios son únicos
- La validación es **case-insensitive** (`LOWER()`)
- Al crear o actualizar, se valida duplicidad

### Integridad Referencial
- No se puede eliminar un servicio si tiene reservas asociadas
- Validación antes de la eliminación:
  ```sql
  SELECT COUNT(*) FROM servicio_reserva WHERE id_servicio = $1
  ```

### Precio por Persona por Noche
- El precio almacenado es **POR PERSONA POR NOCHE**
- El cálculo total se realiza en el módulo de Reservas:
  ```
  Precio Total = precio_servicio × noches × cant_personas
  ```

### Eliminación Física
- No hay borrado lógico (no existe campo `esta_activo`)
- La eliminación es permanente
- Solo se permite si no hay reservas asociadas

---

## 🔍 Validaciones

### Schema: `validateCreateServicio`

```javascript
{
  nom_servicio: {
    tipo: "string",
    obligatorio: true,
    maxLength: 200,
    trim: true,
    unico: true
  },
  precio_servicio: {
    tipo: "number",
    obligatorio: true,
    min: 0
  }
}
```

### Schema: `validateUpdateServicio`

```javascript
{
  // Al menos un campo debe ser enviado
  nom_servicio: {
    tipo: "string",
    opcional: true,
    maxLength: 200,
    trim: true
  },
  precio_servicio: {
    tipo: "number",
    opcional: true,
    min: 0
  }
}
```

---

## 🔗 Integración con Reservas

### Flujo del Cliente (Sin Fricción)

```
1. Cliente consulta disponibilidad
   └─> POST /api/reservas/disponibilidad (SIN LOGIN)

2. Cliente selecciona cabañas disponibles
   └─> Frontend: Checkbox para cabañas

3. Cliente consulta servicios
   └─> GET /api/servicios (SIN LOGIN) ✅

4. Cliente selecciona servicios
   └─> Frontend: Checkbox para servicios

5. Frontend calcula monto total
   └─> Muestra desglose: Cabañas + Servicios

6. Cliente se autentica
   └─> POST /api/users/login

7. Cliente confirma reserva
   └─> POST /api/reservas (CON TOKEN)
       Body: {
         cabanas_ids: [1, 2],
         servicios_ids: [1, 2]  ← IDs de servicios
       }
```

### Cálculo en el Módulo de Reservas

```javascript
// Obtener precios de servicios
const serviciosData = await client.query(
  `SELECT id_servicio, precio_servicio 
   FROM servicios 
   WHERE id_servicio = ANY($1)`,
  [servicios_ids]
);

// Calcular monto total de servicios
let montoServicios = 0;
serviciosData.rows.forEach(servicio => {
  montoServicios += parseFloat(servicio.precio_servicio) * noches * cant_personas;
});

// Monto total reserva
const montoTotal = montoCabanas + montoServicios;
```

### Inserción en `servicio_reserva`

```javascript
// Después de crear la reserva
for (const idServicio of servicios_ids) {
  await client.query(
    `INSERT INTO servicio_reserva (id_reserva, id_servicio)
     VALUES ($1, $2)`,
    [idReserva, idServicio]
  );
}
```

---

## 🗂️ Estructura del Código

```
backend/src/modules/servicios/
│
├── controllers/
│   └── servicio.controller.js      # Controladores HTTP
│
├── routes/
│   └── servicio.routes.js          # Definición de rutas
│
├── schemas/
│   └── servicio.schemas.js         # Validaciones
│
├── services/
│   └── servicio.service.js         # Lógica de negocio
│
├── index.js                         # Punto de entrada del módulo
└── README.md                        # Documentación del módulo
```

### Arquitectura en Capas

```
┌─────────────────────────────────────┐
│         HTTP Request                │
└────────────┬────────────────────────┘
             ▼
┌─────────────────────────────────────┐
│   Routes (servicio.routes.js)       │
│   - Aplica middlewares              │
│   - Autorización                    │
└────────────┬────────────────────────┘
             ▼
┌─────────────────────────────────────┐
│  Controller (servicio.controller.js)│
│  - Valida entrada (schemas)         │
│  - Llama al service                 │
│  - Formatea respuesta               │
└────────────┬────────────────────────┘
             ▼
┌─────────────────────────────────────┐
│   Service (servicio.service.js)     │
│   - Lógica de negocio               │
│   - Queries a BD                    │
│   - Transacciones                   │
└────────────┬────────────────────────┘
             ▼
┌─────────────────────────────────────┐
│         PostgreSQL Database         │
└─────────────────────────────────────┘
```

---

## 📊 Queries SQL Optimizadas

### Listar Servicios
```sql
SELECT 
  id_servicio,
  nom_servicio,
  precio_servicio
FROM servicios
ORDER BY nom_servicio ASC
```

### Detalle con Estadísticas
```sql
SELECT 
  s.id_servicio,
  s.nom_servicio,
  s.precio_servicio,
  COUNT(DISTINCT sr.id_reserva) as total_reservas
FROM servicios s
LEFT JOIN servicio_reserva sr ON s.id_servicio = sr.id_servicio
WHERE s.id_servicio = $1
GROUP BY s.id_servicio, s.nom_servicio, s.precio_servicio
```

### Validar Unicidad (Case-Insensitive)
```sql
SELECT id_servicio 
FROM servicios 
WHERE LOWER(nom_servicio) = LOWER($1)
```

### Verificar Reservas Asociadas
```sql
SELECT COUNT(*) as total 
FROM servicio_reserva 
WHERE id_servicio = $1
```

---

## 🧪 Casos de Prueba

### Casos Exitosos

1. **Listar servicios sin autenticación** ✅
2. **Crear servicio con datos válidos** ✅
3. **Actualizar solo nombre** ✅
4. **Actualizar solo precio** ✅
5. **Eliminar servicio sin reservas** ✅

### Casos de Error

1. **Crear con nombre duplicado** → 409
2. **Crear con precio negativo** → 400
3. **Actualizar con nombre vacío** → 400
4. **Eliminar servicio con reservas** → 400
5. **Obtener servicio inexistente** → 404
6. **ID inválido (abc)** → 400

---

## 📝 Notas Importantes

### ✅ Decisiones de Diseño

1. **Endpoint público para listar**: Facilita el flujo del cliente sin fricción
2. **Sin borrado lógico**: La tabla no tiene campo `esta_activo` por diseño
3. **Eliminación física con validación**: Solo si no hay reservas asociadas
4. **Precio POR PERSONA POR NOCHE**: Según modelo de negocio establecido
5. **Nombres case-insensitive**: Evita duplicados sutiles

### ⚠️ Consideraciones

- Los servicios son catálogos simples (no tienen estado activo/inactivo)
- Si se necesita "ocultar" servicios temporalmente, se debe modificar la BD
- La eliminación es permanente (no reversible)
- Los precios se almacenan con 2 decimales (NUMERIC 10,2)

---

## 🚀 Integración en el Sistema

### 1. Módulo exportado en `index.js`
```javascript
import { Router } from "express";
import servicioRoutes from "./routes/servicio.routes.js";

const router = Router();
router.use("/servicios", servicioRoutes);

export default router;
```

### 2. Montado en aplicación principal
```javascript
// backend/src/index.js
import serviciosModule from "./modules/servicios/index.js";
app.use("/api", serviciosModule);
```

### 3. Rutas finales
```
GET    /api/servicios
GET    /api/servicios/:id
POST   /api/servicios
PATCH  /api/servicios/:id
DELETE /api/servicios/:id
```

---

## 📚 Recursos Adicionales

- Ver `EJEMPLOS_SERVICIOS.http` para ejemplos de peticiones completas
- Ver `README.md` para guía rápida de uso
- Ver `MODULO_RESERVAS.md` para integración con reservas

---

**Autor**: Sistema de Gestión Kallma Resort  
**Versión**: 1.0.0  
**Última actualización**: Octubre 2025
