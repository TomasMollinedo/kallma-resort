# 💳 Módulo de Pagos

## ✅ Estado: IMPLEMENTADO

Módulo completo de gestión de pagos para Kallma Resort. Permite registrar pagos de reservas, consultar historial, anular pagos con borrado lógico, y mantener actualizados los montos pagados de cada reserva.

## Estructura

```
pagos/
├── controllers/
│   └── pago.controller.js         ✅ Implementado
├── services/
│   └── pago.service.js            ✅ Implementado
├── routes/
│   └── pago.routes.js             ✅ Implementado
├── schemas/
│   └── pago.schemas.js            ✅ Implementado
├── index.js                       ✅ Implementado
└── README.md
```

## Endpoints Implementados

- ✅ `GET /api/pagos` - Listar pagos con filtros (según rol)
- ✅ `GET /api/pagos/:id` - Ver detalle de pago con auditoría
- ✅ `GET /api/reservas/:id/pagos` - Historial de pagos por reserva
- ✅ `POST /api/reservas/:id/pagos` - Registrar nuevo pago (Operador/Admin)
- ✅ `DELETE /api/pagos/:id` - Anular pago (Operador/Admin)

## Permisos

- **Cliente**: Ver solo sus propios pagos (filtros limitados)
- **Operador**: Ver todos + registrar + anular pagos
- **Administrador**: Control total + filtros completos

## Lógica de Negocio Implementada

### Registro de Pagos (Transaccional):
1. Validar que la reserva existe y está activa
2. Validar que monto > 0
3. Validar que monto + monto_pagado <= monto_total_res
4. INSERT en tabla `pago`
5. UPDATE `reserva.monto_pagado` += monto
6. Si monto_pagado >= monto_total → `esta_pagada = TRUE`
7. Registrar auditoría (usuario_creacion)

### Anulación de Pagos (Transaccional):
1. Validar que el pago existe y está activo
2. Validar que la reserva está activa
3. UPDATE `pago.esta_activo = FALSE`
4. UPDATE `reserva.monto_pagado` -= monto
5. Recalcular `reserva.esta_pagada`
6. Registrar auditoría (usuario_modific)

## Filtros Disponibles

**Operador/Admin:**
- `cod_reserva`: Búsqueda parcial por código
- `fecha_desde`, `fecha_hasta`: Rango de fechas
- `esta_activo`: true/false (activos/anulados)
- `id_medio_pago`: 1=Efectivo, 2=Débito, 3=Crédito
- `limit`, `offset`: Paginación

**Cliente:**
- `esta_activo`: true/false
- `limit`, `offset`: Paginación

## Documentación Completa

📚 Ver documentación detallada en: `/backend/MODULO_PAGOS.md`
📝 Ver ejemplos HTTP en: `/backend/EJEMPLOS_PAGOS.http`

## Integración

Módulo montado en `/api/pagos` en `src/index.js`
