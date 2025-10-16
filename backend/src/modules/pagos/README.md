# 💳 Módulo de Pagos

## Estructura

```
pagos/
├── controllers/
│   └── pago.controller.js
├── services/
│   └── pago.service.js
├── repositories/
│   └── pago.repository.js
├── routes/
│   └── pago.routes.js
├── middlewares/
│   └── pago.middleware.js
├── schemas/
│   └── pago.schemas.js
└── index.js
```

## Responsabilidades

- Registrar pagos de reservas
- Actualizar estado de pago de reservas
- Calcular montos pendientes
- Historial de pagos por reserva

## Endpoints Sugeridos

- `GET /api/pagos` - Listar pagos (según rol)
- `GET /api/pagos/:id` - Ver detalle de pago
- `POST /api/pagos` - Registrar pago (Staff)
- `GET /api/reservas/:id/pagos` - Pagos de una reserva
- `GET /api/pagos/reportes` - Reportes de pagos (Admin)

## Permisos

- **Cliente**: Ver solo sus propios pagos
- **Operador**: Ver todos + registrar pagos
- **Administrador**: Control total + reportes

## Lógica de Negocio

- Validar que la reserva existe
- Validar que el monto no exceda el pendiente
- Actualizar `monto_pagado` en reserva
- Actualizar `esta_pagada` si monto_pagado >= monto_total_res
