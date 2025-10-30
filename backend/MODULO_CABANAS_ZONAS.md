# 🏡 Módulo de Cabañas y Zonas

## 📋 Tabla de Contenidos
- [Descripción General](#descripción-general)
- [Módulo de Zonas](#módulo-de-zonas)
- [Módulo de Cabañas](#módulo-de-cabañas)
- [Reglas de Negocio](#reglas-de-negocio)
- [Ejemplos de Uso](#ejemplos-de-uso)

---

## 📖 Descripción General

Implementación completa de los módulos de **Zonas** y **Cabañas** para el sistema interno de Kallma Resort. Ambos módulos siguen la arquitectura modular del proyecto y manejan seguridad basada en roles.

### Tecnologías
- **Node.js** + **Express**
- **PostgreSQL** con consultas parametrizadas
- **JWT** para autenticación
- **Validación de schemas** personalizada

---

## 🗺️ Módulo de Zonas

### Estructura
```
modules/zonas/
├── controllers/
│   └── zona.controller.js
├── services/
│   └── zona.service.js
├── routes/
│   └── zona.routes.js
├── schemas/
│   └── zona.schemas.js
└── index.js
```

### Endpoints

#### 1. **GET /api/zonas**
**Descripción:** Listar todas las zonas activas.

**Acceso:** Operador / Admin

**Query Parameters:**
- `esta_activa` (opcional): `true` | `false` - Filtrar por estado

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "id_zona": 1,
      "nom_zona": "Zona Norte",
      "capacidad_cabanas": 10,
      "esta_activa": true
    }
  ],
  "total": 1
}
```

---

#### 2. **GET /api/zonas/:id**
**Descripción:** Obtener detalle de una zona específica.

**Acceso:** Operador / Admin

**Response:**
```json
{
  "ok": true,
  "data": {
    "id_zona": 1,
    "nom_zona": "Zona Norte",
    "capacidad_cabanas": 10,
    "esta_activa": true,
    "total_cabanas": 5
  }
}
```

---

#### 3. **POST /api/zonas**
**Descripción:** Crear una nueva zona.

**Acceso:** Solo Admin

**Body:**
```json
{
  "nom_zona": "Zona Sur",
  "capacidad_cabanas": 15
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Zona creada exitosamente",
  "data": {
    "id_zona": 2,
    "nom_zona": "Zona Sur",
    "capacidad_cabanas": 15,
    "esta_activa": true
  }
}
```

**Validaciones:**
- `nom_zona`: obligatorio, máximo 200 caracteres, único
- `capacidad_cabanas`: obligatorio, número entero >= 0

---

#### 4. **PATCH /api/zonas/:id**
**Descripción:** Actualizar una zona existente.

**Acceso:** Solo Admin

**Body:** (todos los campos opcionales)
```json
{
  "nom_zona": "Zona Sur Premium",
  "capacidad_cabanas": 20
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Zona actualizada exitosamente",
  "data": {
    "id_zona": 2,
    "nom_zona": "Zona Sur Premium",
    "capacidad_cabanas": 20,
    "esta_activa": true
  }
}
```

---

#### 5. **DELETE /api/zonas/:id**
**Descripción:** Eliminar una zona (borrado lógico).

**Acceso:** Solo Admin

**Restricciones:**
- No se puede eliminar si tiene cabañas activas asociadas

**Response:**
```json
{
  "ok": true,
  "message": "Zona eliminada exitosamente",
  "data": {
    "id_zona": 2,
    "nom_zona": "Zona Sur Premium",
    "capacidad_cabanas": 20,
    "esta_activa": false
  }
}
```

---

#### 6. **POST /api/zonas/:id/restaurar**
**Descripción:** Restaurar una zona eliminada.

**Acceso:** Solo Admin

**Response:**
```json
{
  "ok": true,
  "message": "Zona restaurada exitosamente",
  "data": {
    "id_zona": 2,
    "nom_zona": "Zona Sur Premium",
    "capacidad_cabanas": 20,
    "esta_activa": true
  }
}
```

---

## 🏠 Módulo de Cabañas

### Estructura
```
modules/cabanas/
├── controllers/
│   └── cabana.controller.js
├── services/
│   └── cabana.service.js
├── routes/
│   └── cabana.routes.js
├── schemas/
│   └── cabana.schemas.js
└── index.js
```

### Estados de Cabaña (Modelo Real con Booleanos)

La tabla `cabana` usa **dos campos booleanos** para manejar estados:

1. **`esta_activo`** (BOOLEAN):
   - `TRUE` = Cabaña activa (puede ser usada)
   - `FALSE` = Cabaña inactiva (borrado lógico)

2. **`en_mantenimiento`** (BOOLEAN):
   - `TRUE` = Cabaña cerrada por mantenimiento
   - `FALSE` = Cabaña operativa

**Combinaciones posibles:**
- `esta_activo=TRUE` + `en_mantenimiento=FALSE` → **Activa y disponible**
- `esta_activo=TRUE` + `en_mantenimiento=TRUE` → **Activa pero en mantenimiento**
- `esta_activo=FALSE` → **Eliminada (borrado lógico)**

**NOTA:** La documentación anterior mencionaba `id_est_cab` pero el código real usa estos campos booleanos.

### Endpoints

#### 1. **GET /api/cabanas**
**Descripción:** Listar cabañas con filtros opcionales. Incluye indicador de **reservada_hoy**.

**Acceso:** Operador / Admin

**Query Parameters:**
- `cod_cabana` (opcional): Código de cabaña (búsqueda parcial)
- `id_zona` (opcional): ID de la zona
- `esta_activo` (opcional): `true` | `false` - Filtrar por estado activo/inactivo
- `en_mantenimiento` (opcional): `true` | `false` - Filtrar por mantenimiento

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "id_cabana": 1,
      "cod_cabana": "CAB-001",
      "id_tipo_cab": 1,
      "nom_tipo_cab": "Esencial",
      "capacidad": 2,
      "precio_noche": 70000.00,
      "id_zona": 1,
      "nom_zona": "Zona Norte",
      "esta_activo": true,
      "en_mantenimiento": false,
      "fecha_creacion": "2025-01-15T10:00:00.000Z",
      "fecha_modific": "2025-01-16T14:30:00.000Z",
      "usuario_creacion": "Juan Admin",
      "usuario_modificacion": "María Operadora",
      "reservada_hoy": true
    }
  ],
  "total": 1
}
```

---

#### 2. **GET /api/cabanas/reservadas**
**Descripción:** Listar cabañas reservadas para una fecha específica.

**Acceso:** Operador / Admin

**Query Parameters:**
- `fecha` (opcional): formato `YYYY-MM-DD` (por defecto: HOY)

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "id_cabana": 1,
      "cod_cabana": "CAB-001",
      "en_mantenimiento": false,
      "nom_tipo_cab": "Esencial",
      "nom_zona": "Zona Norte",
      "cod_reserva": "RES-001",
      "check_in": "2025-01-15T12:00:00.000Z",
      "check_out": "2025-01-17T10:00:00.000Z",
      "estado_reserva": "Finalizada",
      "fecha_creacion": "2025-01-10T09:00:00.000Z",
      "fecha_modific": null,
      "usuario_creacion": "Admin Sistema",
      "usuario_modificacion": null
    }
  ],
  "total": 1,
  "fecha_consultada": "2025-01-16"
}
```

---

#### 3. **GET /api/cabanas/zona/:idZona**
**Descripción:** Listar cabañas de una zona específica.

**Acceso:** Operador / Admin

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "id_cabana": 1,
      "cod_cabana": "CAB-001",
      "nom_tipo_cab": "Esencial",
      "nom_zona": "Zona Norte",
      "reservada_hoy": false
    }
  ],
  "total": 1
}
```

---

#### 4. **GET /api/cabanas/:id**
**Descripción:** Obtener detalle de una cabaña específica. Incluye indicador de **reservada_hoy**.

**Acceso:** Operador / Admin

**Response:**
```json
{
  "ok": true,
  "data": {
    "id_cabana": 1,
    "cod_cabana": "CAB-001",
    "id_tipo_cab": 1,
    "nom_tipo_cab": "Esencial",
    "capacidad": 2,
    "precio_noche": 70000.00,
    "id_zona": 1,
    "nom_zona": "Zona Norte",
    "esta_activo": true,
    "en_mantenimiento": false,
    "fecha_creacion": "2025-01-15T10:00:00.000Z",
    "fecha_modific": "2025-01-16T10:30:00.000Z",
    "usuario_creacion": "Admin Principal",
    "usuario_modificacion": "Juan Operador",
    "reservada_hoy": true
  }
}
```

---

#### 5. **POST /api/cabanas**
**Descripción:** Crear una nueva cabaña.

**Acceso:** Solo Admin

**Body:**
```json
{
  "cod_cabana": "CAB-002",
  "id_tipo_cab": 2,
  "id_zona": 1
}
```

**NOTA:** Los campos `esta_activo` y `en_mantenimiento` se inicializan automáticamente:
- `esta_activo`: TRUE (por defecto)
- `en_mantenimiento`: FALSE (por defecto)

**Response:**
```json
{
  "ok": true,
  "message": "Cabaña creada exitosamente",
  "data": {
    "id_cabana": 2,
    "cod_cabana": "CAB-002",
    "id_tipo_cab": 2,
    "id_zona": 1,
    "esta_activo": true,
    "en_mantenimiento": false,
    "fecha_creacion": "2025-01-17T10:00:00.000Z"
  }
}
```

**Validaciones:**
- `cod_cabana`: obligatorio, máximo 50 caracteres, único
- `id_tipo_cab`: obligatorio, debe existir y estar activo
- `id_zona`: obligatorio, debe existir y estar activa

---

#### 6. **PATCH /api/cabanas/:id**
**Descripción:** Actualizar una cabaña.

**Acceso:** 
- **Admin:** Puede actualizar cualquier campo (código, tipo, zona, mantenimiento, estado activo)
- **Operador:** Solo puede cambiar `en_mantenimiento` entre `true` ↔ `false`

**Body Admin (puede actualizar cualquier combinación):**
```json
{
  "cod_cabana": "CAB-002-PREMIUM",
  "id_tipo_cab": 3,
  "id_zona": 2,
  "en_mantenimiento": true,
  "esta_activo": true
}
```

**Body Operador (SOLO puede cambiar mantenimiento):**
```json
{
  "en_mantenimiento": true
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Cabaña actualizada exitosamente",
  "data": {
    "id_cabana": 2,
    "cod_cabana": "CAB-002-PREMIUM",
    "id_tipo_cab": 3,
    "id_zona": 2,
    "esta_activo": true,
    "en_mantenimiento": true,
    "fecha_modific": "2025-01-17T11:00:00.000Z"
  }
}
```

**Restricciones Operador:**
- Solo puede modificar `en_mantenimiento` (true/false)
- NO puede modificar: `cod_cabana`, `id_tipo_cab`, `id_zona`, `esta_activo`
- No puede cambiar cabañas inactivas (`esta_activo=FALSE`)

---

#### 7. **DELETE /api/cabanas/:id**
**Descripción:** Eliminar una cabaña (borrado lógico - cambiar estado a Inactiva).

**Acceso:** Solo Admin

**Restricciones:**
- No se puede eliminar si tiene reservas activas (check_out >= hoy)

**Response:**
```json
{
  "ok": true,
  "message": "Cabaña eliminada exitosamente",
  "data": {
    "id_cabana": 2,
    "cod_cabana": "CAB-002-PREMIUM",
    "id_tipo_cab": 3,
    "id_zona": 2,
    "esta_activo": false,
    "en_mantenimiento": false,
    "fecha_modific": "2025-01-17T12:00:00.000Z"
  }
}
```

---

#### 8. **POST /api/cabanas/:id/restaurar**
**Descripción:** Restaurar una cabaña eliminada.

**Acceso:** Solo Admin

**Response:**
```json
{
  "ok": true,
  "message": "Cabaña restaurada exitosamente",
  "data": {
    "id_cabana": 2,
    "cod_cabana": "CAB-002-PREMIUM",
    "id_tipo_cab": 3,
    "id_zona": 2,
    "esta_activo": true,
    "en_mantenimiento": false,
    "fecha_modific": "2025-01-17T13:00:00.000Z"
  }
}
```

---

## 🔒 Reglas de Negocio

### Zonas
1. ✅ Solo Admin puede crear, actualizar y eliminar zonas
2. ✅ Operador puede listar y ver detalle de zonas
3. ✅ No se puede eliminar una zona con cabañas activas
4. ✅ Los nombres de zona deben ser únicos (case-insensitive)
5. ✅ La capacidad debe ser >= 0
6. ⚠️ **SIN campos de auditoría** (fecha_creacion, fecha_modific, usuarios) - Solo campos básicos

### Cabañas (Modelo Real con Campos Booleanos)
1. ✅ Solo Admin puede crear cabañas (con `esta_activo=TRUE` y `en_mantenimiento=FALSE` por defecto)
2. ✅ Admin puede actualizar cualquier campo: `cod_cabana`, `id_tipo_cab`, `id_zona`, `esta_activo`, `en_mantenimiento`
3. ✅ Admin puede hacer borrado lógico (`esta_activo` → FALSE)
4. ✅ Operador solo puede cambiar `en_mantenimiento` entre TRUE ↔ FALSE (NO puede cambiar otros campos)
5. ✅ No se puede eliminar cabaña con reservas activas (check_out >= hoy)
6. ✅ Los códigos de cabaña deben ser únicos (case-insensitive)
7. ✅ Indicador `reservada_hoy`: verifica si la cabaña tiene una reserva activa para HOY
8. ✅ **Auditoría completa**: fecha_creacion, fecha_modific, usuario_creacion, usuario_modificacion
9. ✅ Cliente no interactúa directamente con cabañas (solo a través de reservas)

### Verificación de Reservas
- Una cabaña está **reservada** para una fecha si:
  - Existe en `cabanas_reserva`
  - La reserva tiene `check_in <= fecha <= check_out`
  - El estado de la reserva NO es `Cancelada`

---

## 🧪 Ejemplos de Uso

### 1. Crear una Zona (Admin)
```http
POST /api/zonas
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "nom_zona": "Zona Montaña",
  "capacidad_cabanas": 8
}
```

### 2. Listar Cabañas de una Zona (Operador)
```http
GET /api/cabanas/zona/1
Authorization: Bearer <operador_token>
```

### 3. Cambiar Estado de Cabaña a Mantenimiento (Operador)
```http
PATCH /api/cabanas/5
Authorization: Bearer <operador_token>
Content-Type: application/json

{
  "id_est_cab": 1
}
```

### 4. Actualizar Cabaña Completamente (Admin)
```http
PATCH /api/cabanas/5
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "cod_cabana": "CAB-PREMIUM-005",
  "id_tipo_cab": 3,
  "id_est_cab": 3,
  "id_zona": 2
}
```

### 5. Ver Cabañas Reservadas para una Fecha
```http
GET /api/cabanas/reservadas?fecha=2025-01-20
Authorization: Bearer <operador_token>
```

### 6. Eliminar Cabaña (Admin)
```http
DELETE /api/cabanas/10
Authorization: Bearer <admin_token>
```

### 7. Restaurar Cabaña (Admin)
```http
POST /api/cabanas/10/restaurar
Authorization: Bearer <admin_token>
```

---

## 📊 Códigos de Error

### Zonas
- `400` - Datos de entrada inválidos
- `404` - Zona no encontrada
- `409` - Nombre de zona duplicado
- `400` - Zona tiene cabañas activas (al eliminar)

### Cabañas
- `400` - Datos de entrada inválidos
- `403` - Operador intentando modificar campos no permitidos
- `404` - Cabaña no encontrada
- `409` - Código de cabaña duplicado
- `400` - Cabaña tiene reservas activas (al eliminar)
- `400` - Tipo/Estado/Zona no existe o inactivo

---

## ✅ Testing Checklist

### Zonas
- [ ] Crear zona (Admin)
- [ ] Listar zonas activas (Operador/Admin)
- [ ] Ver detalle de zona con conteo de cabañas (Operador/Admin)
- [ ] Actualizar zona (Admin)
- [ ] Eliminar zona sin cabañas (Admin)
- [ ] Intentar eliminar zona con cabañas activas (debe fallar)
- [ ] Restaurar zona eliminada (Admin)
- [ ] Verificar permisos: Operador no puede crear/modificar/eliminar

### Cabañas
- [ ] Crear cabaña (Admin)
- [ ] Listar cabañas con filtros (Operador/Admin)
- [ ] Ver detalle de cabaña con `reservada_hoy` (Operador/Admin)
- [ ] Listar cabañas por zona (Operador/Admin)
- [ ] Listar cabañas reservadas para fecha específica (Operador/Admin)
- [ ] Actualizar cabaña completa (Admin)
- [ ] Cambiar estado Activa ↔ Mantenimiento (Operador)
- [ ] Operador intenta cambiar otros campos (debe fallar)
- [ ] Operador intenta cambiar a Inactiva (debe fallar)
- [ ] Eliminar cabaña sin reservas (Admin)
- [ ] Intentar eliminar cabaña con reservas activas (debe fallar)
- [ ] Restaurar cabaña eliminada (Admin)
- [ ] Verificar permisos: Cliente no puede acceder

---

## 🎯 Integración con Otros Módulos

### Relaciones
- **Cabañas ↔ Zonas**: Foreign key `id_zona`
- **Cabañas ↔ Tipo Cabaña**: Foreign key `id_tipo_cab`
- **Cabañas ↔ Estado Cabaña**: Foreign key `id_est_cab`
- **Cabañas ↔ Reservas**: Tabla intermedia `cabanas_reserva`

### Próximos Módulos
- **Reservas**: Utilizará las cabañas para asignar reservas
- **Pagos**: Se vinculará a las reservas

---

**Módulos implementados siguiendo la arquitectura modular del proyecto. Listos para producción.** 🚀
