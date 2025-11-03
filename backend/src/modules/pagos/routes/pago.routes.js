/**
 * Rutas del módulo de Pagos
 * Define los endpoints y aplica los middlewares de autenticación y autorización
 */

import { Router } from "express";
import {
  listarPagos,
  listarPagosPropios,
  obtenerPago,
  obtenerPagosDeReserva,
  registrarPago,
  anularPago,
} from "../controllers/pago.controller.js";
import {
  authenticate,
  requireStaff,
} from "../../users/middlewares/auth.middleware.js";

const router = Router();

/**
 * GET /api/pagos/me
 * Listar pagos propios del cliente autenticado
 * Los filtros se aplican solo a las reservas del cliente
 * Query params:
 *  - cod_reserva: búsqueda por código de reserva (parcial, solo en sus reservas)
 *  - fecha_desde: fecha inicio del rango (formato YYYY-MM-DD)
 *  - fecha_hasta: fecha fin del rango (formato YYYY-MM-DD)
 *  - esta_activo: true/false (pagos activos o anulados)
 *  - id_medio_pago: filtrar por método de pago (1=Efectivo, 2=Tarjeta débito, 3=Tarjeta crédito)
 *  - limit, offset: paginación
 * Acceso: Cliente
 */
router.get("/me", authenticate, listarPagosPropios);

/**
 * GET /api/pagos
 * Listar todos los pagos con filtros
 * Query params:
 *  - cod_reserva: búsqueda por código de reserva (parcial)
 *  - fecha_desde: fecha inicio del rango (formato YYYY-MM-DD)
 *  - fecha_hasta: fecha fin del rango (formato YYYY-MM-DD)
 *  - esta_activo: true/false (pagos activos o anulados)
 *  - id_medio_pago: filtrar por método de pago (1=Efectivo, 2=Tarjeta débito, 3=Tarjeta crédito)
 *  - limit, offset: paginación
 * Acceso: Operador / Admin
 */
router.get("/", authenticate, requireStaff, listarPagos);

/**
 * GET /api/pagos/:id
 * Obtener detalle completo de un pago
 * Incluye información del pago, reserva asociada y auditoría
 * Acceso:
 *  - Cliente: solo pagos de sus propias reservas
 *  - Operador/Admin: todos los pagos
 */
router.get("/:id", authenticate, obtenerPago);

/**
 * GET /api/reservas/:id/pagos
 * Obtener historial de pagos de una reserva específica
 * Acceso:
 *  - Cliente: solo pagos de sus propias reservas
 *  - Operador/Admin: pagos de cualquier reserva
 */
router.get("/reservas/:id/pagos", authenticate, obtenerPagosDeReserva);

/**
 * POST /api/reservas/:id/pagos
 * Registrar un nuevo pago para una reserva
 * Body: { monto, id_medio_pago }
 * Validaciones:
 *  - Reserva debe existir y estar activa (no finalizada, cancelada ni no_show)
 *  - Monto debe ser > 0
 *  - Monto + monto_pagado <= monto_total_res (no sobrepagar)
 *  - Método de pago válido (1, 2 o 3)
 * Acciones:
 *  1. Inserta pago en tabla PAGO
 *  2. Actualiza RESERVA.monto_pagado += monto
 *  3. Si monto_pagado >= monto_total → esta_pagada = TRUE
 *  4. Registra usuario que hizo el pago
 * Acceso: Operador / Admin
 */
router.post("/reservas/:id/pagos", authenticate, requireStaff, registrarPago);

/**
 * DELETE /api/pagos/:id
 * Anular un pago (borrado lógico)
 * Validaciones:
 *  - Pago debe existir y estar activo
 *  - Reserva debe estar activa (no finalizada, cancelada ni no_show)
 * Acciones:
 *  1. Cambia PAGO.esta_activo = FALSE
 *  2. Resta monto del RESERVA.monto_pagado
 *  3. Recalcula RESERVA.esta_pagada
 * Acceso: Operador / Admin
 */
router.delete("/:id", authenticate, requireStaff, anularPago);

export default router;
