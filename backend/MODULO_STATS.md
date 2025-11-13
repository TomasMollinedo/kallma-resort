# MODULO DE ESTADISTICAS / DASHBOARD

## 1. Descripcion general

El modulo `stats` centraliza todas las consultas agregadas necesarias para construir los tableros de Administracion y Operador. El objetivo es ofrecer endpoints de solo lectura que minimicen los roundtrips a PostgreSQL, agrupen la logica de negocio y expongan datos listos para que el frontend renderice cada dashboard con una unica llamada HTTP.

- Base de datos: PostgreSQL (mismas tablas del resto del sistema).
- Cliente DB reutilizado: `pool` desde `src/config/database.js`.
- Estandar arquitectonico: controller + service + routes + schemas + index.
- Seguridad: endpoints protegidos con los mismos middlewares (`authenticate`, `requireAdmin`, `requireStaff`).

---

## 2. Estructura de carpetas

```
src/modules/stats/
├── controllers/
│   └── stats.controller.js      # Orquesta validaciones y respuestas HTTP
├── services/
│   └── stats.service.js         # Consultas agregadas y logica de negocio
├── schemas/
│   └── stats.schemas.js         # Validaciones ligeras de query params
├── routes/
│   └── stats.routes.js          # Definicion de endpoints y middlewares
└── index.js                     # Exporta el router para montarlo en /api/stats
```

El modulo se monta en `src/index.js` con `app.use("/api", statsModule);`, por lo que todas las rutas quedan bajo el prefijo `/api/stats`.

---

## 3. Endpoints REST

### 3.1 GET /api/stats/admin-dashboard

| Aspecto                | Detalle                                                                                  |
|------------------------|------------------------------------------------------------------------------------------|
| Acceso                 | Autenticado + `requireAdmin` (solo rol Administrador).                                   |
| Proposito              | Obtener todas las metricas necesarias para el dashboard administrativo.                  |
| Query params           | **Ninguno**. Si se envía algún parámetro se responde 400.                                |

**Respuesta 200 (ejemplo):**
```json
{
  "ok": true,
  "data": {
    "totalUsers": 128,
    "totalCabins": 36,
    "totalZones": 5,
    "currentMonthRevenue": 1845000,
    "revenueLast12Months": [
      { "year": 2024, "month": 12, "total": 1200000 },
      { "year": 2025, "month": 1, "total": 1850000 }
    ],
    "currentMonthPaymentMethodsDistribution": [
      { "method": "Tarjeta de crédito", "count": 24, "percentage": 60.0 },
      { "method": "Efectivo", "count": 10, "percentage": 25.0 },
      { "method": "Tarjeta de débito", "count": 6, "percentage": 15.0 }
    ]
  }
}
```

**Ejemplo `.http`:**
```
### Dashboard Admin (12 meses por defecto)
GET {{baseUrl}}/stats/admin-dashboard
Authorization: Bearer {{token_admin}}

```

### 3.2 GET /api/stats/operator-dashboard

| Aspecto                | Detalle                                                                                          |
|------------------------|--------------------------------------------------------------------------------------------------|
| Acceso                 | Autenticado + `requireStaff` (roles Operador y Administrador).                                   |
| Proposito              | Entregar un snapshot operacional del dia (ocupacion, check-in/out, pendientes).                  |
| Query params opcionales| `referenceDate` (YYYY-MM-DD) para auditorias historicas. Default: fecha actual del servidor.     |

**Respuesta 200 (ejemplo):**
```json
{
  "ok": true,
  "data": {
    "hostedToday": 84,
    "checkinsToday": 12,
    "checkoutsToday": 9,
    "cabinsInMaintenanceToday": 3,
    "occupancyRate": 72.22,
    "reservationsPendingPayment": 5
  }
}
```

**Ejemplo `.http`:**
```
### Dashboard Operador (fecha actual)
GET {{baseUrl}}/stats/operator-dashboard
Authorization: Bearer {{token_operador}}

### Dashboard Operador (reporte retroactivo)
GET {{baseUrl}}/stats/operator-dashboard?referenceDate=2025-02-01
Authorization: Bearer {{token_admin}}
```

---

## 4. Definicion de metricas

### 4.1 Dashboard Admin

| Campo                                   | Definicion tecnica                                                                                                  |
|-----------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| `totalUsers`                            | `COUNT(*)` de `usuario` donde `esta_activo = TRUE`.                                                                 |
| `totalCabins`                           | `COUNT(*)` de `cabana` con `esta_activo = TRUE`, sin importar mantenimiento.                                        |
| `totalZones`                            | `COUNT(*)` de `zonas` con `esta_activa = TRUE`.                                                                     |
| `currentMonthRevenue`                   | `SUM(monto)` de `pago` activos (`esta_activo = TRUE`) cuyo `fecha_pago` pertenece al mes calendario actual.          |
| `revenueLast12Months`                   | Serie cronologica fija de 12 meses (mes actual y 11 anteriores) agrupada por `year` + `month`. Solo pagos activos dentro de la ventana. |
| `currentMonthPaymentMethodsDistribution`| Conteo de pagos activos por `medio_pago`, convertido a porcentaje respecto del total del mes actual.                |

La serie se rellena aun si un mes no tuvo pagos (total 0), gracias a la ventana generada en memoria dentro del service.

### 4.2 Dashboard Operador

| Campo                           | Definicion tecnica                                                                                                 |
|---------------------------------|---------------------------------------------------------------------------------------------------------------------|
| `hostedToday`                   | `SUM(cant_personas)` de reservas con `check_in <= fecha` y `check_out > fecha`, excluyendo estados `Cancelada`/`No aparecio`. |
| `checkinsToday`                 | `COUNT` de reservas cuya `check_in` coincide con la fecha observada y estado permitido.                             |
| `checkoutsToday`                | `COUNT` de reservas cuya `check_out` coincide con la fecha observada y estado permitido.                            |
| `cabinsInMaintenanceToday`      | `COUNT(*)` de `cabana` con `esta_activo = TRUE` y `en_mantenimiento = TRUE`.                                        |
| `occupancyRate`                 | `cabins_occupied / total_cabins * 100`. Una cabana se considera ocupada si tiene al menos una reserva vigente hoy.  |
| `reservationsPendingPayment`    | `COUNT(*)` de reservas vigentes (sin estados excluidos) con `esta_pagada = FALSE`, independiente de la fecha.       |

Los estados excluidos se parametrizan via `EXCLUDED_RESERVATION_STATES = ['Cancelada','No aparecio']` para mantener consistencia con el negocio.

---

## 5. Validaciones y manejo de errores

- `stats.schemas.js` asegura que solo se acepten los query params esperados.
  - `monthsBack` debe ser entero en rango `[1, 24]`.
  - `referenceDate` debe parsear como fecha valida (`YYYY-MM-DD`).
  - Cualquier parametro no soportado genera respuesta 400 con arreglo `errors`.
- Los services arrojan errores genericos (`ERROR_ADMIN_DASHBOARD_STATS`, `ERROR_OPERATOR_DASHBOARD_STATS`) registrados en el log del servidor. El controller captura y responde 500 manteniendo la consistencia del API.
- Middlewares de autenticacion/autorization detienen tempranamente accesos no permitidos (401/403).

---

## 6. Integracion con otros modulos

- **Usuarios:** se reutilizan `authenticate`, `requireAdmin`, `requireStaff`.
- **Reservas y Cabanas:** las tablas `reserva`, `cabanas_reserva`, `cabana` y `estado_operativo` alimentan la logica de ocupacion.
- **Pagos:** todas las metricas financieras se basan en la tabla `pago` vinculada a `medio_pago`.
- **Config global:** no se crea un `pool` nuevo; se usa `pool` compartido, respetando la configuracion de timezone definida en `src/config/database.js`.

---

## 7. Escenarios recomendados

1. **Home del Admin:** llamar `GET /api/stats/admin-dashboard` apenas el usuario ingresa para renderizar tarjetas de totales, grafico de barras mensual y pie chart de metodos de pago.
2. **Operaciones diarias:** refrescar `GET /api/stats/operator-dashboard` cada cierto intervalo (ej. 60 s) para monitorear check-ins, check-outs y ocupacion en vivo.
3. **Reportes historicos:** usar `GET /api/stats/operator-dashboard?referenceDate=YYYY-MM-DD` para auditorias pasadas o conciliaciones puntuales.

---

## 8. Extensiones futuras

- Agregar filtros por zona o tipo de cabana en el dashboard Admin (nuevos query params validados en `stats.schemas.js`).
- Incorporar metricas adicionales para el Operador (por ejemplo, reservas con check-in atrasado) reutilizando el mismo CTE `base_reservas`.
- Versionar las respuestas en caso de que el frontend necesite evolucionar sin romper compatibilidad (`/api/v2/stats/...`).

Este documento debe mantenerse sincronizado con cualquier cambio en `stats.service.js` para asegurar que los dashboards sigan consumiendo datos consistentes.
