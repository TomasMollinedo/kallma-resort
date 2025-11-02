# 📅 Módulo de Reservas

## Estructura

```
reservas/
├── controllers/
│   └── reserva.controller.js
├── services/
│   └── reserva.service.js
├── repositories/
│   └── reserva.repository.js
├── routes/
│   └── reserva.routes.js
├── middlewares/
│   └── reserva.middleware.js
├── schemas/
│   └── reserva.schemas.js
├── mappers/
│   └── reserva.mapper.js
└── index.js
```

## Responsabilidades

- Gestión completa del ciclo de vida de reservas
- Validación de disponibilidad de cabañas
- Cálculo de precios (cabañas + servicios)
- Asignación de cabañas a reservas
- Gestión de estados operativos

## Endpoints Sugeridos

- `GET /api/reservas` - Listar reservas (según rol)
- `GET /api/reservas/:id` - Ver detalle de reserva
- `POST /api/reservas` - Crear reserva
- `PUT /api/reservas/:id` - Actualizar reserva
- `DELETE /api/reservas/:id` - Cancelar reserva
- `GET /api/reservas/disponibilidad` - Consultar disponibilidad
- `POST /api/reservas/:id/cabanas` - Asignar cabañas
- `POST /api/reservas/:id/servicios` - Agregar servicios

## Respuestas de la API

### Campos Retornados en GET /api/reservas (Listado)

El endpoint de listado retorna los siguientes campos para cada reserva:
- `id_reserva`: ID de la reserva
- `cod_reserva`: Código único de la reserva
- `check_in`: Fecha de entrada (DATE)
- `check_out`: Fecha de salida (DATE)
- `cant_personas`: Cantidad de personas
- `noches`: Cantidad de noches calculadas (check_out - check_in)
- `id_est_op`: ID del estado operativo
- `estado_operativo`: Nombre del estado operativo
- `esta_pagada`: Booleano indicando si está pagada
- `monto_total_res`: Monto total de la reserva
- `monto_pagado`: Monto pagado
- `cliente_nombre`: Nombre del cliente
- `cliente_email`: Email del cliente
- `cantidad_cabanas`: Cantidad de cabañas asignadas
- `cantidad_servicios`: Cantidad de servicios adicionales

**Nota:** Los campos de auditoría (`fecha_creacion`, `fecha_modific`) NO se incluyen en el listado. Solo están disponibles en el detalle individual.

### Campos Retornados en GET /api/reservas/:id (Detalle)

El endpoint de detalle retorna toda la información de la reserva incluyendo:
- Todos los campos básicos de la reserva
- `noches`: Cantidad de noches calculadas
- `fecha_creacion`: Fecha de creación de la reserva
- `fecha_modific`: Fecha de última modificación
- `usuario_creacion`: Nombre del usuario que creó la reserva
- `usuario_modificacion`: Nombre del usuario que modificó la reserva
- `cliente_telefono`: Teléfono del cliente
- `cabanas`: Array de cabañas asignadas con:
  - `id_cabana`, `cod_cabana`
  - `nom_tipo_cab`, `capacidad`, `precio_noche`
  - `nom_zona`
- `servicios`: Array de servicios adicionales con:
  - `id_servicio`, `nom_servicio`, `precio_servicio`

## Filtros de Listado de Reservas

### GET /api/reservas (Operador/Admin)

#### Parámetros de Query

**Buscador:**
- `cod_reserva`: búsqueda parcial por código de reserva (case-insensitive)

**Filtros por Ventana de Fechas:**
- `fecha_desde`, `fecha_hasta`: ventana con superposición. Formato `YYYY-MM-DD`
  - Retorna reservas que se superpongan con el rango `[fecha_desde, fecha_hasta)`
  - Puede usarse solo `fecha_desde` (reservas futuras desde esa fecha)
  - Puede usarse solo `fecha_hasta` (reservas que comienzan antes de esa fecha)

**Presets Explícitos por Día:**
- `arrivals_on=D`: llegadas ese día específico (`r.check_in = D`)
- `departures_on=D`: salidas ese día específico (`r.check_out = D`)
- `inhouse_on=D`: hospedados ese día específico (`r.check_in <= D AND r.check_out > D`)

**Otros Filtros:**
- `id_est_op`: filtrar por ID de estado operativo
- `esta_pagada`: `true` o `false`

#### Notas Importantes

- Todas las fechas deben enviarse en formato `YYYY-MM-DD` (solo fecha, sin hora)
- Los filtros pueden combinarse y se aplican con operador `AND`
- Las columnas `check_in` y `check_out` son de tipo `DATE` en la base de datos
- La ventana usa lógica inclusiva-exclusiva: `[fecha_desde, fecha_hasta)`
- Para `inhouse_on`, la lógica excluye el día de checkout (convención hotelera)

#### Ejemplos de Uso

**1. Reservas entre el 10 y el 20 de noviembre:**
```
GET /api/reservas?fecha_desde=2025-11-10&fecha_hasta=2025-11-20
```
Retorna todas las reservas que se superpongan con este período (check-in antes del 20 y check-out después del 10).

**2. Próxima semana (ejemplo: 3-10 noviembre):**
```
GET /api/reservas?fecha_desde=2025-11-03&fecha_hasta=2025-11-10
```
Retorna reservas que tengan al menos una noche en la semana del 3 al 9 de noviembre.

**3. Reservas desde hoy en adelante:**
```
GET /api/reservas?fecha_desde=2025-11-02
```
Sin `fecha_hasta`, retorna todas las reservas futuras (check-out > 2025-11-02).

**4. Llegadas de un día específico:**
```
GET /api/reservas?arrivals_on=2025-11-10
```
Retorna **solo** reservas con check-in exactamente el 10 de noviembre.

**5. Salidas de un día específico:**
```
GET /api/reservas?departures_on=2025-11-10
```
Retorna **solo** reservas con check-out exactamente el 10 de noviembre.

**6. Huéspedes alojados en un día específico (In-house):**
```
GET /api/reservas?inhouse_on=2025-11-10
```
Retorna reservas donde los huéspedes están físicamente alojados el 10 de noviembre.
- Check-in debe ser el 10 o antes: `r.check_in <= 2025-11-10`
- Check-out debe ser después del 10: `r.check_out > 2025-11-10`

**7. Buscar por código de reserva:**
```
GET /api/reservas?cod_reserva=RES-20251110
```
Búsqueda parcial case-insensitive. Retorna reservas cuyo código contenga "RES-20251110".

**8. Búsqueda combinada:**
```
GET /api/reservas?cod_reserva=RES-2025&inhouse_on=2025-11-10&esta_pagada=true
```
Busca reservas pagadas con código que contenga "RES-2025" y con huéspedes alojados el 10 de noviembre.

**9. Reservas pendientes de pago en rango de fechas:**
```
GET /api/reservas?fecha_desde=2025-11-01&fecha_hasta=2025-11-30&esta_pagada=false
```
Reservas no pagadas que se superpongan con noviembre 2025.

## Permisos

- **Cliente**: Ver/crear solo sus propias reservas
- **Operador**: Ver todas + crear para cualquier cliente
- **Administrador**: Control total

## Relaciones

- Reserva N:M con Cabañas (tabla `cabanas_reserva`)
- Reserva N:M con Servicios (tabla `servicio_reserva`)
- Reserva 1:N con Pagos
