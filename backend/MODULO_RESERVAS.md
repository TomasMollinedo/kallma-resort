# 📅 Módulo de Reservas y Disponibilidad

## 📋 Descripción

Módulo completo de gestión de reservas para Kallma Resort. Incluye consulta de disponibilidad en tiempo real, creación transaccional de reservas con cabañas y servicios, y gestión de estados con reglas de negocio específicas por rol.

---

## 🏗️ Arquitectura

```
reservas/
├── controllers/
│   └── reserva.controller.js      # Manejo de peticiones HTTP
├── services/
│   └── reserva.service.js         # Lógica de negocio y queries SQL
├── routes/
│   └── reserva.routes.js          # Definición de endpoints y middlewares
├── schemas/
│   └── reserva.schemas.js         # Validaciones de entrada
├── index.js                       # Exportación del módulo
└── README.md                      # Documentación básica
```

---

## 🔌 Endpoints

### 1. **POST /api/reservas/disponibilidad**
Consulta disponibilidad de cabañas en un rango de fechas.

**Autenticación:** ❌ No requerida (público)

**Body:**
```json
{
  "check_in": "2025-12-01",
  "check_out": "2025-12-05",
  "cant_personas": 4
}
```

**Respuesta exitosa (200):**
```json
{
  "ok": true,
  "data": [
    {
      "id_cabana": 1,
      "cod_cabana": "CAB-001",
      "id_tipo_cab": 2,
      "nom_tipo_cab": "Confort",
      "capacidad": 4,
      "precio_noche": "130000.00",
      "id_zona": 1,
      "nom_zona": "Zona Norte",
      "noches": 4,
      "precio_total": "520000.00"
    }
  ],
  "total": 1,
  "parametros": {
    "check_in": "2025-12-01",
    "check_out": "2025-12-05",
    "cant_personas": 4
  }
}
```

**Lógica de disponibilidad:**
- Cabañas activas (`esta_activo = TRUE`)
- No en mantenimiento (`en_mantenimiento = FALSE`)
- Sin superposición de fechas con reservas activas (no canceladas)

---

### 2. **POST /api/reservas**
Crea una nueva reserva con cabañas y servicios (transacción atómica).

**Autenticación:** Requerida (cualquier usuario autenticado)

**Body:**
```json
{
  "check_in": "2025-12-01",
  "check_out": "2025-12-05",
  "cant_personas": 4,
  "cabanas_ids": [1, 2],
  "servicios_ids": [1, 3]
}
```

**Respuesta exitosa (201):**
```json
{
  "ok": true,
  "message": "Reserva creada exitosamente",
  "data": {
    "id_reserva": 15,
    "cod_reserva": "RES-20251022-00001",
    "check_in": "2025-12-01",
    "check_out": "2025-12-05",
    "cant_personas": 4,
    "estado_operativo": "Cancelada",
    "esta_pagada": false,
    "monto_total_res": "700000.00",
    "monto_pagado": "175000.00",
    "noches": 4,
    "cabanas": [...],
    "servicios": [...]
  }
}
```

**Proceso transaccional:**
1. Validar existencia y disponibilidad de cabañas
2. **Validar que suma de capacidades ≥ cant_personas**
3. Verificar que no estén reservadas en las fechas seleccionadas
4. Validar servicios (opcional)
5. Calcular monto total (cabañas × noches + servicios)
6. **Calcular seña del 25% del monto total**
7. Generar código único de reserva
8. Crear reserva en DB con estado **"Confirmada"** y `monto_pagado` = 25% del total
9. Insertar relaciones en `cabanas_reserva` y `servicio_reserva`

**Código de reserva:** Formato `RES-YYYYMMDD-XXXXX`

---

### 3. **GET /api/reservas/me**
Lista las reservas del cliente autenticado.

**Autenticación:** Requerida (Cliente)

**Query params:**
- `id_est_op` (opcional): Filtrar por estado operativo
- `esta_pagada` (opcional): Filtrar por estado de pago (`true`/`false`)

**Respuesta exitosa (200):**
```json
{
  "ok": true,
  "data": [
    {
      "id_reserva": 15,
      "cod_reserva": "RES-20251022-00001",
      "check_in": "2025-12-01",
      "check_out": "2025-12-05",
      "cant_personas": 4,
      "estado_operativo": "Cancelada",
      "esta_pagada": false,
      "monto_total_res": "700000.00",
      "monto_pagado": "175000.00",
      "cantidad_cabanas": 2,
      "cantidad_servicios": 2
    }
  ],
  "total": 1
}
```

---

### 4. **GET /api/reservas**
Lista todas las reservas con filtros (Operador/Admin).

**Autenticación:** Requerida (Operador / Admin)

**Query params:**
- `cod_reserva` (opcional): Búsqueda parcial por código
- `check_in` (opcional): Filtrar desde fecha check-in
- `check_out` (opcional): Filtrar hasta fecha check-out
- `id_est_op` (opcional): Filtrar por estado operativo
- `esta_pagada` (opcional): Filtrar por estado de pago

**Respuesta exitosa (200):**
```json
{
  "ok": true,
  "data": [
    {
      "id_reserva": 15,
      "cod_reserva": "RES-20251022-00001",
      "check_in": "2025-12-01",
      "check_out": "2025-12-05",
      "cant_personas": 4,
      "estado_operativo": "Cancelada",
      "esta_pagada": false,
      "monto_total_res": "700000.00",
      "monto_pagado": "175000.00",
      "cliente_nombre": "Juan Pérez",
      "cliente_email": "juan@example.com",
      "cantidad_cabanas": 2,
      "cantidad_servicios": 2
    }
  ],
  "total": 1
}
```

---

### 5. **GET /api/reservas/:id**
Obtiene el detalle completo de una reserva.

**Autenticación:** Requerida
- **Cliente:** Solo puede ver sus propias reservas
- **Operador/Admin:** Pueden ver cualquier reserva

**Respuesta exitosa (200):**
```json
{
  "ok": true,
  "data": {
    "id_reserva": 15,
    "cod_reserva": "RES-20251022-00001",
    "check_in": "2025-12-01",
    "check_out": "2025-12-05",
    "cant_personas": 4,
    "estado_operativo": "Cancelada",
    "esta_pagada": false,
    "monto_total_res": "700000.00",
    "monto_pagado": "175000.00",
    "cliente_nombre": "Juan Pérez",
    "cliente_email": "juan@example.com",
    "cliente_telefono": "+5491123456789",
    "noches": 4,
    "cabanas": [
      {
        "id_cabana": 1,
        "cod_cabana": "CAB-001",
        "nom_tipo_cab": "Confort",
        "capacidad": 4,
        "precio_noche": "130000.00",
        "nom_zona": "Zona Norte"
      }
    ],
    "servicios": [
      {
        "id_servicio": 1,
        "nom_servicio": "Desayuno",
        "precio_servicio": "15000.00"
      }
    ]
  }
}
```

---

### 6. **PATCH /api/reservas/:id/status**
Actualiza el estado de una reserva (operativo y/o financiero).

**Autenticación:** Requerida (Cliente / Operador / Admin)

**Reglas por rol:**

#### **Cliente:**
- Solo puede modificar **su propia reserva**
- Solo puede cambiar a estado **"Cancelada"** (`id_est_op`)
- Restricción: Cancelación hasta **24 horas antes** del check-in
- No puede cancelar una reserva ya cancelada

**Body (Cliente):**
```json
{
  "id_est_op": 1
}
```

#### **Operador / Admin:**
- Pueden cambiar estado operativo a:
  - `id_est_op = 2` → "No aparecio"
  - `id_est_op = 3` → "Finalizada"
  - **NO pueden cambiar a "Cancelada"** (solo cliente)
- Pueden modificar estado financiero:
  - `esta_pagada`: `true`/`false`
  - `monto_pagado`: monto numérico

**Body (Operador/Admin):**
```json
{
  "id_est_op": 3,
  "esta_pagada": true,
  "monto_pagado": 700000.00
}
```

**Respuesta exitosa (200):**
```json
{
  "ok": true,
  "message": "Estado de reserva actualizado exitosamente",
  "data": {
    "id_reserva": 15,
    "cod_reserva": "RES-20251022-00001",
    "estado_operativo": "Finalizada",
    "esta_pagada": true,
    "monto_pagado": "700000.00",
    ...
  }
}
```

**Errores comunes:**
- `400`: "Solo puede cancelar hasta 24 horas antes del check-in"
- `400`: "La reserva ya está cancelada"
- `403`: "No tiene permisos para modificar esta reserva"

---

## 💰 Cálculo de Montos y Seña

### Fórmula de Cálculo

**Monto Total de la Reserva:**
```
monto_total_res = (Σ precio_noche_cabañas × noches) + (Σ precio_servicios × noches × cant_personas)
```

**Monto de Seña (25%):**
```
monto_pagado = monto_total_res × 0.25
```

### Regla de Negocio: Seña Obligatoria

Al crear una reserva, el sistema **automáticamente calcula y registra una seña del 25%** del monto total en el campo `monto_pagado`.

**Características:**
- ✅ **Porcentaje fijo:** 25% no configurable
- ✅ **Cálculo automático:** Backend calcula sin intervención del usuario
- ✅ **Estado de pago:** `esta_pagada = FALSE` (solo pagó seña, no el total)
- ✅ **Saldo pendiente:** `monto_total_res - monto_pagado` (75% restante)

**Ejemplo práctico:**
```
Monto total de reserva: $700,000
Seña automática (25%): $175,000
Saldo pendiente (75%): $525,000
```

El campo `esta_pagada` permanece en `FALSE` hasta que el cliente complete el pago total de la reserva. El staff puede actualizar `monto_pagado` y `esta_pagada` mediante el endpoint `PATCH /api/reservas/:id/status`.

---

## 🔐 Matriz de Permisos

| Endpoint | Público | Cliente | Operador | Admin |
|----------|---------|---------|----------|-------|
| `POST /disponibilidad` | ✅ | ✅ | ✅ | ✅ |
| `POST /reservas` | ❌ | ✅ | ✅ | ✅ |
| `GET /reservas/me` | ❌ | ✅ (propias) | ❌ | ❌ |
| `GET /reservas` | ❌ | ❌ | ✅ | ✅ |
| `GET /reservas/:id` | ❌ | ✅ (propias) | ✅ | ✅ |
| `PATCH /reservas/:id/status` | ❌ | ✅ (restricciones) | ✅ | ✅ |

---

## 📊 Estados Operativos

Según el esquema de base de datos:

| ID | Estado | Descripción |
|----|--------|-------------|
| 1 | Cancelada | Reserva cancelada por el cliente |
| 2 | **Confirmada** | **Reserva activa (estado por defecto)** |
| 3 | No aparecio | Cliente no se presentó (solo Staff) |
| 4 | Finalizada | Reserva completada (solo Staff) |

**✅ Estado por defecto:** Las reservas nuevas se crean automáticamente con estado **"Confirmada"** (id_est_op = 2).

**💡 Mejora sugerida:** Agregar estado adicional:
- `En curso`: Cliente realizó check-in (para distinguir de confirmada)

---

## 🔄 Flujo de Reserva (Sin Fricción)

```
1. Usuario SIN LOGIN consulta disponibilidad
   POST /api/reservas/disponibilidad
   - No requiere autenticación
   - Puede explorar cabañas disponibles libremente

2. Frontend muestra cabañas disponibles
   - Usuario selecciona cabañas (suma capacidades >= cant_personas)
   - Usuario agrega servicios opcionales
   - Sistema calcula monto total

3. Usuario se autentica SOLO al confirmar reserva
   - Frontend solicita login/registro
   - Usuario ingresa credenciales

4. Usuario autenticado crea reserva
   POST /api/reservas
   - Se crea reserva con estado "Confirmada"
   - **Se registra automáticamente seña del 25% en monto_pagado**
   - Se genera código único (RES-YYYYMMDD-XXXXX)
   - Se vinculan cabañas en cabanas_reserva
   - Se vinculan servicios en servicio_reserva
   - Backend valida: suma capacidades >= cant_personas

5. Cliente puede ver sus reservas
   GET /api/reservas/me
   GET /api/reservas/:id

6. Cliente puede cancelar (hasta 24h antes)
   PATCH /api/reservas/:id/status

7. Staff gestiona check-in/check-out
   PATCH /api/reservas/:id/status
   - Marcar como "Finalizada" o "No aparecio"
   - Actualizar estado de pago
```

---

## 🗄️ Estructura de Base de Datos

### Tabla `reserva`
```sql
- id_reserva (PK)
- cod_reserva (UNIQUE)
- check_in (DATE)
- check_out (DATE)
- cant_personas (INTEGER)
- id_est_op (FK → estado_operativo)
- esta_pagada (BOOLEAN)
- monto_total_res (NUMERIC)
- monto_pagado (NUMERIC)
- fecha_creacion, id_usuario_creacion
- fecha_modific, id_usuario_modific
```

### Tabla `cabanas_reserva` (N:M)
```sql
- id_cab_res (PK)
- id_cabana (FK → cabana)
- id_reserva (FK → reserva)
- UNIQUE (id_cabana, id_reserva)
```

### Tabla `servicio_reserva` (N:M)
```sql
- id_serv_res (PK)
- id_reserva (FK → reserva)
- id_servicio (FK → servicios)
- UNIQUE (id_reserva, id_servicio)
```

---

## ✅ Validaciones Implementadas

### Disponibilidad
- `check_in` y `check_out` obligatorios (formato YYYY-MM-DD)
- `check_in` no puede ser en el pasado
- `check_out` debe ser posterior a `check_in`
- `cant_personas` entero positivo (máximo 10)

### Crear Reserva
- Todas las validaciones de disponibilidad
- `cabanas_ids` array con al menos 1 cabaña
- IDs válidos y sin duplicados
- **Suma de capacidades ≥ cant_personas** (validado en backend)
- `servicios_ids` opcional (array de IDs si se proporciona)

### Actualizar Estado
- Validaciones diferenciadas por rol
- Cliente: solo `id_est_op` a "Cancelada"
- Staff: `id_est_op`, `esta_pagada`, `monto_pagado`

---

## 🚨 Errores Comunes

### 400 Bad Request
```json
{
  "ok": false,
  "errors": [
    {
      "field": "check_in",
      "message": "La fecha de check-in no puede ser en el pasado"
    }
  ]
}
```

### 404 Not Found
```json
{
  "ok": false,
  "error": "Reserva no encontrada"
}
```

### 403 Forbidden
```json
{
  "ok": false,
  "error": "No tiene permisos para ver esta reserva"
}
```

---

## 🛠️ Optimizaciones SQL

### Query de Disponibilidad
- Uso de `NOT EXISTS` para excluir cabañas ocupadas
- Detección de superposición de fechas con 3 condiciones
- Filtrado por estados activos en todas las tablas relacionadas

### Creación de Reserva
- Transacción atómica con `BEGIN/COMMIT/ROLLBACK`
- Validaciones antes de insertar datos
- Generación de código único con secuencial diario

### Consultas con Agregación
- `COUNT(DISTINCT)` para cantidad de cabañas y servicios
- `GROUP BY` para consolidar información
- `LEFT JOIN` para incluir reservas sin servicios

---

## 📝 Mejoras Implementadas y Sugeridas

### ✅ Implementado:
- Estado "Confirmada" como estado por defecto para reservas nuevas
- Disponibilidad pública sin autenticación (flujo sin fricción)
- Validación de suma de capacidades de cabañas
- Límite máximo de 10 personas por reserva

### 💡 Sugerencias Futuras:

1. **Estados de Reserva:**
   - Agregar estado "En curso" para check-in realizado
   - Agregar estado "Pendiente" para reservas con pago pendiente

2. **Notificaciones:**
   - Email de confirmación al crear reserva
   - Email de recordatorio 48h antes del check-in
   - Email de cancelación

3. **Pagos:**
   - Integración con módulo de pagos
   - Registro de pagos parciales
   - Cálculo automático de saldo pendiente

4. **Disponibilidad:**
   - Cache de disponibilidad para rangos populares
   - Bloqueo temporal de cabañas durante proceso de reserva

---

## 📚 Archivos Generados

1. `src/modules/reservas/schemas/reserva.schemas.js` - Validaciones
2. `src/modules/reservas/services/reserva.service.js` - Lógica de negocio
3. `src/modules/reservas/controllers/reserva.controller.js` - Controllers
4. `src/modules/reservas/routes/reserva.routes.js` - Rutas
5. `src/modules/reservas/index.js` - Exportación del módulo
6. `MODULO_RESERVAS.md` - Esta documentación
7. `EJEMPLOS_RESERVAS.http` - Ejemplos de requests HTTP

---

## 🎯 Testing Recomendado

### Casos de prueba:
1. Consultar disponibilidad con fechas válidas
2. Crear reserva con 1 cabaña y 0 servicios
3. Crear reserva con múltiples cabañas y servicios
4. Intentar crear reserva con fechas ocupadas
5. Cliente cancelando su propia reserva (dentro de 24h)
6. Cliente intentando cancelar fuera de plazo
7. Operador marcando reserva como "Finalizada"
8. Cliente intentando ver reserva de otro usuario

---

**Versión:** 1.0  
**Fecha:** Octubre 2025  
**Desarrollado para:** Kallma Resort
