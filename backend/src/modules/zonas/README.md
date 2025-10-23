# 🗺️ Módulo de Zonas

## Descripción
Módulo completo para la gestión de zonas del resort. Permite crear, listar, actualizar y eliminar zonas donde se ubicarán las cabañas.

## Estructura
```
zonas/
├── controllers/
│   └── zona.controller.js      # Manejo de requests HTTP
├── services/
│   └── zona.service.js          # Lógica de negocio
├── routes/
│   └── zona.routes.js           # Definición de endpoints
├── schemas/
│   └── zona.schemas.js          # Validación de datos
└── index.js                     # Exporta rutas del módulo
```

## Endpoints

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/api/zonas` | Operador/Admin | Listar zonas activas |
| GET | `/api/zonas/:id` | Operador/Admin | Detalle de zona |
| POST | `/api/zonas` | Solo Admin | Crear zona |
| PATCH | `/api/zonas/:id` | Solo Admin | Actualizar zona |
| DELETE | `/api/zonas/:id` | Solo Admin | Eliminar zona (borrado lógico) |
| POST | `/api/zonas/:id/restaurar` | Solo Admin | Restaurar zona eliminada |

## Modelo de Datos

```sql
zonas (
  id_zona             SERIAL PRIMARY KEY,
  nom_zona            VARCHAR(200) NOT NULL UNIQUE,
  capacidad_cabanas   INTEGER NOT NULL CHECK (capacidad_cabanas >= 0),
  esta_activa         BOOLEAN NOT NULL DEFAULT TRUE
)
```

## Validaciones

### Crear Zona
- `nom_zona`: obligatorio, máximo 200 caracteres, único
- `capacidad_cabanas`: obligatorio, número entero >= 0

### Actualizar Zona
- Todos los campos opcionales
- Si se envía `nom_zona`, debe ser único
- Si se envía `capacidad_cabanas`, debe ser >= 0

## Reglas de Negocio

1. **Permisos de Acceso**
   - Solo Admin puede crear, actualizar y eliminar zonas
   - Operador puede listar y ver detalle de zonas

2. **Validación de Eliminación**
   - No se puede eliminar una zona si tiene cabañas activas asociadas
   - La eliminación es lógica (cambia `esta_activa` a `FALSE`)

3. **Nombres Únicos**
   - Los nombres de zona son case-insensitive y únicos
   - Ej: "Zona Norte" y "zona norte" se consideran duplicados

4. **Restauración**
   - Solo Admin puede restaurar zonas eliminadas
   - La restauración activa nuevamente la zona

## Ejemplo de Uso

### Crear Zona (Admin)
```http
POST /api/zonas
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "nom_zona": "Zona Montaña",
  "capacidad_cabanas": 12
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Zona creada exitosamente",
  "data": {
    "id_zona": 3,
    "nom_zona": "Zona Montaña",
    "capacidad_cabanas": 12,
    "esta_activa": true
  }
}
```

### Listar Zonas (Operador)
```http
GET /api/zonas
Authorization: Bearer <operador_token>
```

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
    },
    {
      "id_zona": 2,
      "nom_zona": "Zona Sur",
      "capacidad_cabanas": 8,
      "esta_activa": true
    }
  ],
  "total": 2
}
```

## Códigos de Error

- `400` - Datos de entrada inválidos o zona tiene cabañas activas
- `403` - Operador intenta crear/modificar/eliminar
- `404` - Zona no encontrada
- `409` - Nombre de zona duplicado

## Testing

Ver archivo `EJEMPLOS_CABANAS_ZONAS.http` para ejemplos completos de testing.

## Integración

### Con Módulo de Cabañas
- Las cabañas tienen una foreign key `id_zona` que referencia a esta tabla
- No se puede eliminar una zona si tiene cabañas activas

## Implementado ✅

- [x] CRUD completo de zonas
- [x] Validación de permisos por rol
- [x] Borrado lógico con restauración
- [x] Validación de eliminación (sin cabañas activas)
- [x] Nombres únicos case-insensitive
- [x] Schemas de validación
- [x] Manejo de errores estructurado
