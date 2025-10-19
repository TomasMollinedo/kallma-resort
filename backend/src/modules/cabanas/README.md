# 🏠 Módulo de Cabañas

## Descripción
Módulo completo para la gestión de cabañas del resort. Incluye CRUD completo, gestión de estados basada en roles, y verificación de reservas activas.

## Estructura
```
cabanas/
├── controllers/
│   └── cabana.controller.js     # Manejo de requests HTTP
├── services/
│   └── cabana.service.js        # Lógica de negocio
├── routes/
│   └── cabana.routes.js         # Definición de endpoints
├── schemas/
│   └── cabana.schemas.js        # Validación de datos
└── index.js                     # Exporta rutas del módulo
```

## Endpoints

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/api/cabanas` | Operador/Admin | Listar cabañas con filtros |
| GET | `/api/cabanas/reservadas` | Operador/Admin | Cabañas reservadas por fecha |
| GET | `/api/cabanas/zona/:idZona` | Operador/Admin | Listar cabañas por zona |
| GET | `/api/cabanas/:id` | Operador/Admin | Detalle de cabaña |
| POST | `/api/cabanas` | Solo Admin | Crear cabaña |
| PATCH | `/api/cabanas/:id` | Operador/Admin* | Actualizar cabaña |
| DELETE | `/api/cabanas/:id` | Solo Admin | Eliminar cabaña (borrado lógico) |
| POST | `/api/cabanas/:id/restaurar` | Solo Admin | Restaurar cabaña eliminada |

**Operador solo puede cambiar estado entre Activa ↔ Cerrada por Mantenimiento*

## Modelo de Datos

```sql
cabana (
  id_cabana            SERIAL PRIMARY KEY,
  cod_cabana           VARCHAR(50) NOT NULL UNIQUE,
  id_tipo_cab          INTEGER NOT NULL REFERENCES tipo_cabana(id_tipo_cab),
  id_est_cab           INTEGER NOT NULL REFERENCES estado_cabana(id_est_cab),
  id_zona              INTEGER NOT NULL REFERENCES zonas(id_zona),
  esta_activo          BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion       TIMESTAMPTZ NOT NULL,
  id_usuario_creacion  INTEGER NOT NULL REFERENCES usuario(id_usuario),
  id_usuario_modific   INTEGER REFERENCES usuario(id_usuario),
  fecha_modific        TIMESTAMPTZ
)
```

## Estados de Cabaña

| ID | Nombre | Descripción |
|----|--------|-------------|
| 1 | Cerrada por Mantenimiento | Cabaña en mantenimiento |
| 2 | Inactiva | Borrado lógico |
| 3 | Activa | Cabaña disponible para reservas |

## Validaciones

### Crear Cabaña (Admin)
- `cod_cabana`: obligatorio, máximo 50 caracteres, único
- `id_tipo_cab`: obligatorio, debe existir y estar activo
- `id_est_cab`: obligatorio, debe existir
- `id_zona`: obligatorio, debe existir y estar activa

### Actualizar Cabaña (Admin)
- Todos los campos opcionales
- Se validan referencias si se actualizan
- Si se cambia `cod_cabana`, debe ser único

### Actualizar Estado (Operador)
- Solo puede modificar `id_est_cab`
- Solo puede cambiar a estados: 1 o 3
- No puede cambiar cabañas inactivas

## Reglas de Negocio

### 1. Permisos por Rol

#### Administrador
- ✅ Crear cabañas
- ✅ Actualizar cualquier campo
- ✅ Cambiar a cualquier estado (incluido Inactiva)
- ✅ Eliminar cabañas (borrado lógico)
- ✅ Restaurar cabañas eliminadas

#### Operador
- ✅ Ver todas las cabañas
- ✅ Cambiar estado entre **Activa** ↔ **Cerrada por Mantenimiento**
- ❌ No puede crear cabañas
- ❌ No puede cambiar otros campos
- ❌ No puede cambiar a estado Inactiva
- ❌ No puede eliminar ni restaurar

#### Cliente
- ❌ No interactúa directamente con este módulo

### 2. Indicador `reservada_hoy`
Todas las respuestas de cabañas incluyen el campo `reservada_hoy` que indica si la cabaña está reservada para la fecha actual.

**Lógica:**
- Existe en `cabanas_reserva`
- La reserva tiene `check_in <= HOY <= check_out`
- El estado de la reserva NO es `Cancelada`

### 3. Validaciones de Eliminación
- No se puede eliminar una cabaña con reservas activas (check_out >= hoy)
- La eliminación es lógica (cambia `esta_activo` a `FALSE`)
- El estado también se puede cambiar a `Inactiva` (id=2)

### 4. Códigos Únicos
- Los códigos de cabaña son case-sensitive y únicos
- Ej: "CAB-001" y "cab-001" se consideran diferentes

### 5. Filtros Disponibles
- Por estado (`id_est_cab`)
- Por código (`cod_cabana` - búsqueda parcial)
- Por zona (`id_zona`)
- Por activo/inactivo (`esta_activo`)

## Endpoints Especiales

### 1. Cabañas Reservadas
```http
GET /api/cabanas/reservadas?fecha=2025-01-20
```
Retorna cabañas que tienen reservas activas para la fecha especificada. Si no se proporciona fecha, usa HOY.

### 2. Cabañas por Zona
```http
GET /api/cabanas/zona/1
```
Retorna todas las cabañas activas de una zona específica, con el indicador `reservada_hoy`.

## Ejemplo de Uso

### Crear Cabaña (Admin)
```http
POST /api/cabanas
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "cod_cabana": "CAB-015",
  "id_tipo_cab": 2,
  "id_est_cab": 3,
  "id_zona": 1
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Cabaña creada exitosamente",
  "data": {
    "id_cabana": 15,
    "cod_cabana": "CAB-015",
    "id_tipo_cab": 2,
    "id_est_cab": 3,
    "id_zona": 1,
    "esta_activo": true,
    "fecha_creacion": "2025-01-17T10:00:00.000Z"
  }
}
```

### Cambiar Estado a Mantenimiento (Operador)
```http
PATCH /api/cabanas/15
Authorization: Bearer <operador_token>
Content-Type: application/json

{
  "id_est_cab": 1
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Cabaña actualizada exitosamente",
  "data": {
    "id_cabana": 15,
    "cod_cabana": "CAB-015",
    "id_tipo_cab": 2,
    "id_est_cab": 1,
    "id_zona": 1,
    "esta_activo": true,
    "fecha_modific": "2025-01-17T11:00:00.000Z"
  }
}
```

### Ver Cabañas Reservadas para Mañana
```http
GET /api/cabanas/reservadas?fecha=2025-01-18
Authorization: Bearer <operador_token>
```

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "id_cabana": 5,
      "cod_cabana": "CAB-005",
      "nom_tipo_cab": "Confort",
      "nom_zona": "Zona Norte",
      "cod_reserva": "RES-123",
      "check_in": "2025-01-17T14:00:00.000Z",
      "check_out": "2025-01-20T10:00:00.000Z",
      "estado_reserva": "Finalizada"
    }
  ],
  "total": 1,
  "fecha_consultada": "2025-01-18"
}
```

## Códigos de Error

- `400` - Datos inválidos, cabaña inactiva, estado no permitido para operador
- `403` - Operador intenta modificar campos no permitidos
- `404` - Cabaña no encontrada
- `409` - Código de cabaña duplicado
- `400` - Cabaña tiene reservas activas (al eliminar)
- `400` - Referencias no válidas (tipo, estado, zona)

## Testing

Ver archivo `EJEMPLOS_CABANAS_ZONAS.http` para ejemplos completos de testing.

## Integración

### Con Módulo de Zonas
- Foreign key `id_zona` referencia a `zonas`
- Solo acepta zonas activas

### Con Módulo de Tipo Cabaña
- Foreign key `id_tipo_cab` referencia a `tipo_cabana`
- Solo acepta tipos activos

### Con Módulo de Estado Cabaña
- Foreign key `id_est_cab` referencia a `estado_cabana`

### Con Módulo de Reservas
- Relación N:M a través de `cabanas_reserva`
- Se verifica para calcular `reservada_hoy`
- Se valida al eliminar (no permite si hay reservas activas)

## Implementado ✅

- [x] CRUD completo de cabañas
- [x] Validación de permisos por rol diferenciada
- [x] Operador puede cambiar solo estado entre Activa ↔ Mantenimiento
- [x] Admin puede actualizar cualquier campo
- [x] Borrado lógico con restauración
- [x] Indicador `reservada_hoy` en tiempo real
- [x] Endpoint de cabañas reservadas por fecha
- [x] Endpoint de cabañas por zona
- [x] Validación de eliminación (sin reservas activas)
- [x] Códigos únicos
- [x] Schemas de validación separados por rol
- [x] Manejo de errores estructurado
- [x] Queries optimizadas con JOINs
