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

## Permisos

- **Cliente**: Ver/crear solo sus propias reservas
- **Operador**: Ver todas + crear para cualquier cliente
- **Administrador**: Control total

## Relaciones

- Reserva N:M con Cabañas (tabla `cabanas_reserva`)
- Reserva N:M con Servicios (tabla `servicio_reserva`)
- Reserva 1:N con Pagos
