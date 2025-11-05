# 💳 Módulo de Pagos

## 📋 Descripción

Módulo completo de gestión de pagos para Kallma Resort. Permite registrar pagos de reservas, consultar historial de pagos, anular pagos con borrado lógico, y mantener actualizados los montos pagados de cada reserva. Incluye validaciones robustas para evitar sobrepagos y controlar transacciones de manera segura.

---

## 🏗️ Arquitectura

```
pagos/
├── controllers/
│   └── pago.controller.js         # Manejo de peticiones HTTP
├── services/
│   └── pago.service.js            # Lógica de negocio y queries SQL
├── routes/
│   └── pago.routes.js             # Definición de endpoints y middlewares
├── schemas/
│   └── pago.schemas.js            # Validaciones de entrada
├── index.js                       # Exportación del módulo
└── README.md                      # Documentación básica
```

---

## 🔌 Endpoints

### 1. **GET /api/pagos/me**
Lista pagos propios del cliente autenticado con todos los filtros disponibles.

**Autenticación:** ✅ Requerida

**Roles permitidos:** Cliente

**Query params (todos opcionales):**
- `cod_reserva`: Búsqueda parcial por código de reserva (solo en sus reservas)
- `fecha_desde`: Fecha inicio del rango (formato YYYY-MM-DD)
- `fecha_hasta`: Fecha fin del rango (formato YYYY-MM-DD)
- `esta_activo`: `true` (activos) o `false` (anulados)
- `id_medio_pago`: Filtrar por método de pago (1=Efectivo, 2=Débito, 3=Crédito)
- `limit`: Límite de resultados (default: 100, max: 1000)
- `offset`: Offset para paginación (default: 0)

**Respuesta exitosa (200):**
```json
{
  "ok": true,
  "data": [
    {
      "id_pago": 1,
      "fecha_pago": "2025-01-15T14:30:00.000Z",
      "monto": "175000.00",
      "esta_activo": true,
      "id_medio_pago": 3,
      "nom_medio_pago": "Tarjeta de crédito",
      "id_reserva": 5,
      "cod_reserva": "RES-20250115-00001",
      "monto_total_res": "700000.00",
      "monto_pagado": "175000.00",
      "esta_pagada": false,
      "check_in": "2025-02-01",
      "check_out": "2025-02-05",
      "estado_reserva": "Confirmada",
      "usuario_creo_pago": "María Operadora"
    }
  ],
  "pagination": {
    "total": 8,
    "limit": 100,
    "offset": 0,
    "hasMore": false
  }
}
```

**Nota:** Los filtros se aplican automáticamente solo a pagos de reservas del cliente autenticado.

---

### 2. **GET /api/pagos**
Lista todos los pagos del sistema con filtros.

**Autenticación:** ✅ Requerida

**Roles permitidos:** Operador / Administrador

**Query params (todos opcionales):**
- `cod_reserva`: Búsqueda parcial por código de reserva (todas las reservas)
- `fecha_desde`: Fecha inicio del rango (formato YYYY-MM-DD)
- `fecha_hasta`: Fecha fin del rango (formato YYYY-MM-DD)
- `esta_activo`: `true` (activos) o `false` (anulados)
- `id_medio_pago`: Filtrar por método de pago (1=Efectivo, 2=Débito, 3=Crédito)
- `limit`: Límite de resultados (default: 100, max: 1000)
- `offset`: Offset para paginación (default: 0)

**Respuesta exitosa (200):**
```json
{
  "ok": true,
  "data": [
    {
      "id_pago": 1,
      "fecha_pago": "2025-01-15T14:30:00.000Z",
      "monto": "175000.00",
      "esta_activo": true,
      "id_medio_pago": 3,
      "nom_medio_pago": "Tarjeta de crédito",
      "id_reserva": 5,
      "cod_reserva": "RES-20250115-00001",
      "monto_total_res": "700000.00",
      "monto_pagado": "175000.00",
      "esta_pagada": false,
      "check_in": "2025-02-01",
      "check_out": "2025-02-05",
      "estado_reserva": "Confirmada",
      "nombre_cliente": "Juan Pérez",
      "email_cliente": "juan@example.com",
      "usuario_creo_pago": "María Operadora"
    }
  ],
  "pagination": {
    "total": 245,
    "limit": 100,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### 3. **GET /api/pagos/:id**
Obtiene el detalle completo de un pago específico con información de auditoría.

**Autenticación:** ✅ Requerida

**Roles permitidos:**
- **Cliente:** Solo pagos de sus propias reservas
- **Operador/Admin:** Todos los pagos

**Respuesta exitosa (200):**
```json
{
  "ok": true,
  "data": {
    "id_pago": 1,
    "fecha_pago": "2025-01-15T14:30:00.000Z",
    "monto": "175000.00",
    "esta_activo": true,
    "id_medio_pago": 3,
    "nom_medio_pago": "Tarjeta de crédito",
    "id_reserva": 5,
    "cod_reserva": "RES-20250115-00001",
    "check_in": "2025-02-01",
    "check_out": "2025-02-05",
    "cant_personas": 4,
    "monto_total_res": "700000.00",
    "monto_pagado": "175000.00",
    "esta_pagada": false,
    "estado_reserva": "Confirmada",
    "id_cliente": 12,
    "nombre_cliente": "Juan Pérez",
    "email_cliente": "juan@example.com",
    "telefono_cliente": "+54 9 11 1234-5678",
    "id_usuario_creacion": 3,
    "usuario_creacion": "María Operadora",
    "fecha_creacion": "2025-01-15 14:30:00",
    "id_usuario_modific": null,
    "usuario_modificacion": null,
    "fecha_modificacion": null
  }
}
```

**Errores posibles:**
- `400`: ID inválido
- `403`: Sin permiso para ver el pago
- `404`: Pago no encontrado

---

### 4. **GET /api/reservas/:id/pagos**
Obtiene el historial de pagos de una reserva específica.

**Autenticación:** ✅ Requerida

**Roles permitidos:**
- **Cliente:** Solo pagos de sus propias reservas
- **Operador/Admin:** Pagos de cualquier reserva

**Respuesta exitosa (200):**
```json
{
  "ok": true,
  "data": [
    {
      "id_pago": 1,
      "fecha_pago": "2025-01-15T14:30:00.000Z",
      "monto": "175000.00",
      "esta_activo": true,
      "nom_medio_pago": "Tarjeta de crédito",
      "usuario_creo_pago": "María Operadora"
    },
    {
      "id_pago": 2,
      "fecha_pago": "2025-01-20T10:15:00.000Z",
      "monto": "200000.00",
      "esta_activo": true,
      "nom_medio_pago": "Efectivo",
      "usuario_creo_pago": "Carlos Operador"
    }
  ],
  "total": 2
}
```

**Errores posibles:**
- `400`: ID inválido
- `403`: Sin permiso para ver los pagos de la reserva
- `404`: Reserva no encontrada

---

### 5. **POST /api/reservas/:id/pagos**
Registra un nuevo pago para una reserva existente.

**Autenticación:** ✅ Requerida

**Roles permitidos:** Operador / Administrador

**Body:**
```json
{
  "monto": 200000.00,
  "id_medio_pago": 1,
  "fecha_pago": "2025-01-30"
}
```

**Campos:**
- `monto` (obligatorio): Monto del pago (número > 0)
- `id_medio_pago` (obligatorio): Método de pago
  - `1` = Efectivo
  - `2` = Tarjeta de débito
  - `3` = Tarjeta de crédito
- `fecha_pago` (opcional): Fecha del pago en formato YYYY-MM-DD
  - Si no se proporciona, se usa la fecha actual (CURRENT_DATE)
  - No puede ser una fecha futura

**Respuesta exitosa (201):**
```json
{
  "ok": true,
  "message": "Pago registrado exitosamente",
  "data": {
    "id_pago": 3,
    "fecha_pago": "2025-01-30T16:45:00.000Z",
    "monto": "200000.00",
    "esta_activo": true,
    "nom_medio_pago": "Efectivo",
    "id_reserva": 5,
    "cod_reserva": "RES-20250115-00001",
    "monto_total_res": "700000.00",
    "monto_pagado": "375000.00",
    "esta_pagada": false,
    "usuario_creo_pago": "María Operadora"
  }
}
```

**Proceso transaccional:**
1. Verificar que la reserva existe
2. Validar que la reserva esté activa (no finalizada, cancelada ni no_show)
3. Validar que monto > 0
4. Validar que `monto + monto_pagado <= monto_total_res` (no sobrepagar)
5. Verificar que el método de pago existe
6. **INSERT** en tabla `pago`
7. **UPDATE** `reserva.monto_pagado` += monto
8. Si `monto_pagado >= monto_total_res` → `esta_pagada = TRUE`
9. Registrar usuario que creó el pago en auditoría

**Validaciones:**
- ✅ Reserva debe existir
- ✅ Reserva debe estar activa (estado: Confirmada)
- ✅ No se puede pagar una reserva finalizada, cancelada o no_show
- ✅ Monto debe ser mayor a cero
- ✅ No se puede sobrepagar (monto + pagado ≤ total)
- ✅ Método de pago debe ser válido (1, 2 o 3)

**Errores posibles:**
- `400`: Validaciones fallidas, reserva no activa, monto excede total
- `404`: Reserva no encontrada
- `500`: Error en transacción

---

### 6. **DELETE /api/pagos/:id**
Anula un pago (borrado lógico).

**Autenticación:** ✅ Requerida

**Roles permitidos:** Operador / Administrador

**Respuesta exitosa (200):**
```json
{
  "ok": true,
  "message": "Pago anulado exitosamente",
  "data": {
    "id_pago": 3,
    "fecha_pago": "2025-01-30T16:45:00.000Z",
    "monto": "200000.00",
    "esta_activo": false,
    "nom_medio_pago": "Efectivo",
    "id_reserva": 5,
    "cod_reserva": "RES-20250115-00001",
    "monto_total_res": "700000.00",
    "monto_pagado": "175000.00",
    "esta_pagada": false,
    "usuario_creo_pago": "María Operadora"
  }
}
```

**Proceso transaccional:**
1. Verificar que el pago existe y está activo
2. Validar que la reserva esté activa (no finalizada, cancelada ni no_show)
3. **UPDATE** `pago.esta_activo = FALSE`
4. **UPDATE** `reserva.monto_pagado` -= monto del pago
5. Recalcular `reserva.esta_pagada` según nuevo monto
6. Registrar usuario que anuló el pago en auditoría

**Validaciones:**
- ✅ Pago debe existir
- ✅ Pago debe estar activo (no ya anulado)
- ✅ Reserva debe estar activa (estado: Confirmada)
- ✅ No se puede anular pago de reserva finalizada, cancelada o no_show

**Errores posibles:**
- `400`: ID inválido, pago ya anulado, reserva no activa
- `404`: Pago no encontrado
- `500`: Error en transacción

---

## 💾 Modelo de Datos

### Tabla: `pago`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_pago` | SERIAL | ID único (PK) |
| `fecha_pago` | DATE | Fecha del pago (YYYY-MM-DD) |
| `monto` | NUMERIC(10,2) | Monto del pago (> 0) |
| `id_medio_pago` | INTEGER | FK a `medio_pago` |
| `id_reserva` | INTEGER | FK a `reserva` |
| `esta_activo` | BOOLEAN | TRUE=activo, FALSE=anulado |
| `id_usuario_creacion` | INTEGER | FK a `usuario` (quien registró) |
| `id_usuario_modific` | INTEGER | FK a `usuario` (quien modificó) |
| `fecha_modific` | TIMESTAMPTZ | Fecha de modificación |

### Tabla: `medio_pago`

| ID | Nombre |
|----|--------|
| 1 | Efectivo |
| 2 | Tarjeta de débito |
| 3 | Tarjeta de crédito |

---

## 🔐 Seguridad y Permisos

### Por Rol

| Acción | Cliente | Operador | Admin |
|--------|---------|----------|-------|
| Listar pagos | ✅ Propios | ✅ Todos | ✅ Todos |
| Ver detalle de pago | ✅ Propios | ✅ Todos | ✅ Todos |
| Historial de pagos de reserva | ✅ Propias | ✅ Todas | ✅ Todas |
| Registrar pago | ❌ | ✅ | ✅ |
| Anular pago | ❌ | ✅ | ✅ |

### Filtros Disponibles

**Todos los roles tienen acceso a los mismos filtros:**
- `cod_reserva` - Búsqueda parcial por código de reserva
- `fecha_desde`, `fecha_hasta` - Rango de fechas de pago
- `esta_activo` - Pagos activos o anulados
- `id_medio_pago` - Filtrar por método de pago (1, 2 o 3)
- `limit`, `offset` - Paginación

**Diferencia clave:**
- **Cliente (GET /me):** Los filtros se aplican automáticamente solo a pagos de sus propias reservas
- **Operador/Admin (GET /):** Los filtros se aplican a todos los pagos del sistema

---

## ✅ Reglas de Negocio

### 1. Registro de Pagos

- Solo Operador/Admin pueden registrar pagos
- Reserva debe estar en estado **"Confirmada"**
- No se puede pagar reserva **Cancelada**, **Finalizada** o **No apareció**
- Monto debe ser mayor a cero
- **No se puede sobrepagar:** `monto + monto_pagado <= monto_total_res`
- Si después del pago: `monto_pagado >= monto_total_res` → `esta_pagada = TRUE`

### 2. Anulación de Pagos

- Solo Operador/Admin pueden anular pagos
- Solo se puede anular pago **activo** (`esta_activo = TRUE`)
- Reserva debe estar en estado **"Confirmada"**
- Al anular:
  - `pago.esta_activo = FALSE`
  - `reserva.monto_pagado -= monto del pago`
  - Recalcular `reserva.esta_pagada`

### 3. Consulta de Pagos

- Cliente solo ve pagos de sus propias reservas
- Operador/Admin ven todos los pagos
- Filtros de fecha permiten buscar por rango
- Filtro por método de pago para análisis financiero

### 4. Auditoría

- Todos los pagos registran:
  - Usuario que creó el pago (`id_usuario_creacion`)
  - Fecha del pago (`fecha_pago` tipo DATE, por defecto CURRENT_DATE)
  - Usuario que modificó (`id_usuario_modific`)
  - Fecha de modificación (`fecha_modific`)

---

## 🔄 Flujo de Transacciones

### Registro de Pago

```sql
BEGIN;

-- 1. Insertar pago
INSERT INTO pago (fecha_pago, monto, id_medio_pago, id_reserva, esta_activo, id_usuario_creacion)
VALUES (NOW(), $1, $2, $3, TRUE, $4);

-- 2. Actualizar reserva
UPDATE reserva
SET 
  monto_pagado = monto_pagado + $1,
  esta_pagada = (monto_pagado + $1 >= monto_total_res),
  id_usuario_modific = $4,
  fecha_modific = NOW()
WHERE id_reserva = $3;

COMMIT;
```

### Anulación de Pago

```sql
BEGIN;

-- 1. Anular pago
UPDATE pago
SET 
  esta_activo = FALSE,
  id_usuario_modific = $1,
  fecha_modific = NOW()
WHERE id_pago = $2;

-- 2. Actualizar reserva
UPDATE reserva
SET 
  monto_pagado = monto_pagado - (SELECT monto FROM pago WHERE id_pago = $2),
  esta_pagada = (monto_pagado - (SELECT monto FROM pago WHERE id_pago = $2) >= monto_total_res),
  id_usuario_modific = $1,
  fecha_modific = NOW()
WHERE id_reserva = (SELECT id_reserva FROM pago WHERE id_pago = $2);

COMMIT;
```

**Rollback automático:** Si cualquier operación falla, toda la transacción se revierte.

---

## 📊 Ejemplos de Uso

### Caso 1: Registrar Seña del 25%

**Contexto:** Reserva con monto total de ARS $700,000

```http
POST /api/reservas/5/pagos
Authorization: Bearer <token>
Content-Type: application/json

{
  "monto": 175000,
  "id_medio_pago": 3
}
```

**Resultado:**
- Pago registrado: ARS $175,000
- `reserva.monto_pagado`: $0 → $175,000
- `reserva.esta_pagada`: FALSE (falta 75%)

---

### Caso 2: Completar Pago

**Contexto:** Reserva con monto total ARS $700,000, ya pagó ARS $175,000

```http
POST /api/reservas/5/pagos
Authorization: Bearer <token>
Content-Type: application/json

{
  "monto": 525000,
  "id_medio_pago": 1
}
```

**Resultado:**
- Pago registrado: ARS $525,000
- `reserva.monto_pagado`: $175,000 → $700,000
- `reserva.esta_pagada`: TRUE ✅

---

### Caso 3: Intento de Sobrepago (Error)

**Contexto:** Reserva con monto total ARS $700,000, ya pagó ARS $600,000

```http
POST /api/reservas/5/pagos
Authorization: Bearer <token>
Content-Type: application/json

{
  "monto": 200000,
  "id_medio_pago": 1
}
```

**Error 400:**
```json
{
  "ok": false,
  "message": "El monto del pago excede el saldo pendiente de la reserva. Monto restante: ARS $100000.00"
}
```

---

### Caso 4: Anular Pago

**Contexto:** Pago erróneo de ARS $200,000

```http
DELETE /api/pagos/3
Authorization: Bearer <token>
```

**Resultado:**
- `pago.esta_activo`: TRUE → FALSE
- `reserva.monto_pagado`: $375,000 → $175,000
- `reserva.esta_pagada`: recalculado según nuevo monto

---

## 🎯 Casos de Uso

### Para el Cliente

1. **Consultar mis pagos**
   - Ver historial de pagos realizados
   - Verificar saldo pendiente de cada reserva

2. **Ver detalle de un pago**
   - Fecha, monto, método de pago
   - Información de la reserva asociada

---

### Para el Operador/Administrador

1. **Registrar pagos**
   - Al momento del check-in (completar saldo)
   - Pagos adelantados adicionales
   - Registrar método de pago utilizado

2. **Consultar todos los pagos**
   - Filtrar por fecha para cierres diarios
   - Filtrar por método de pago para reconciliación
   - Buscar pagos de una reserva específica

3. **Anular pagos**
   - Corrección de errores
   - Devoluciones
   - Cancelaciones con reembolso

4. **Análisis financiero**
   - Pagos por rango de fechas
   - Pagos por método de pago
   - Identificar reservas con saldo pendiente

---

## 🧪 Testing

### Escenarios de Prueba

#### ✅ Casos Exitosos

1. Registrar pago con todos los datos válidos
2. Anular un pago activo
3. Completar pago de reserva (esta_pagada = TRUE)
4. Consultar historial de pagos de una reserva
5. Filtrar pagos por rango de fechas
6. Filtrar pagos por método de pago

#### ❌ Casos de Error

1. Intentar sobrepagar una reserva
2. Registrar pago con monto negativo o cero
3. Pagar reserva cancelada
4. Pagar reserva finalizada
5. Anular pago ya anulado
6. Cliente intentar registrar pago (403)
7. Método de pago inválido (ID 99)
8. Anular pago de reserva finalizada

---

## 📝 Notas Técnicas

### Optimizaciones SQL

- **INNER JOIN** para garantizar integridad referencial
- **LEFT JOIN** para campos opcionales (usuario_modific)
- **Índices** en: `id_reserva`, `fecha_pago`, `esta_activo`
- **Transacciones atómicas** con BEGIN/COMMIT/ROLLBACK

### Manejo de Fechas

- Tipo `DATE` para `fecha_pago` (solo fecha, sin hora)
- Formato: YYYY-MM-DD
- Por defecto usa CURRENT_DATE si no se especifica
- No se permiten fechas futuras al registrar pagos
- Filtros de fecha_desde y fecha_hasta usan comparación directa (ya no necesitan ::date)

### Cálculos de Montos

- Tipo `NUMERIC(10,2)` para precisión decimal
- Validaciones antes de operaciones aritméticas
- Verificación de sobrepago: `monto + monto_pagado <= monto_total_res`

---

## 🔗 Integración con Otros Módulos

### Reservas

- Cada pago está vinculado a una reserva (`id_reserva`)
- Actualiza `monto_pagado` y `esta_pagada` de la reserva
- Valida estado operativo antes de permitir pagos

### Usuarios

- Auditoría completa: `id_usuario_creacion`, `id_usuario_modific`
- Permisos por rol para registrar y anular pagos
- Cliente solo ve pagos de sus propias reservas

---

## 📚 Recursos Adicionales

- **Archivo de ejemplos:** `EJEMPLOS_PAGOS.http`
- **Esquema de BD:** `context/database.sql`
- **README del módulo:** `src/modules/pagos/README.md`

---

## 🚀 Próximas Mejoras Sugeridas

1. **Reportes financieros**
   - Total recaudado por período
   - Pagos pendientes agrupados
   - Comparativa por método de pago

2. **Notificaciones**
   - Email al cliente cuando se registra un pago
   - Alertas de pagos pendientes próximos al check-in

3. **Historial de cambios**
   - Log de todos los cambios en pagos
   - Auditoría completa para análisis

4. **Pagos parciales múltiples**
   - Planes de pago personalizados
   - Cuotas programadas

---

**Documentación actualizada:** Enero 2025
**Versión del módulo:** 1.0.0
