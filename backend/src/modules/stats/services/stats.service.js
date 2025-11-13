/**
 * Servicios del módulo de estadísticas.
 * Centraliza las consultas agregadas para dashboards sin exponer lógica CRUD.
 */

import { pool } from "../../../config/database.js";

const EXCLUDED_RESERVATION_STATES = ["Cancelada", "No aparecio","Finalizada"];
const EXCLUDED_STATES_SQL = `('${EXCLUDED_RESERVATION_STATES.join("','")}')`;

/**
 * Convierte un valor numérico retornado por PostgreSQL a Number seguro.
 * @param {string|number|null} value - Valor retornado por la base.
 * @returns {number} Valor numérico normalizado.
 */
const toNumber = (value) => {
  if (value === null || value === undefined) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

/**
 * Genera la secuencia de meses (orden cronológico) que se debe retornar.
 * @param {number} monthsBack - Ventana de meses a construir (incluye mes actual).
 * @returns {Array<{ year: number, month: number, key: string }>} Secuencia ordenada.
 */
const buildMonthsWindow = (monthsBack) => {
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonthIndex = now.getUTCMonth(); // 0-11

  const window = [];
  for (let i = monthsBack - 1; i >= 0; i -= 1) {
    const date = new Date(Date.UTC(currentYear, currentMonthIndex - i, 1));
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1; // 1-12
    const monthKey = `${year}-${String(month).padStart(2, "0")}`;
    window.push({ year, month, key: monthKey });
  }

  return window;
};

/**
 * Devuelve la fecha actual (zona horaria del servidor) en formato YYYY-MM-DD.
 * @returns {string} Fecha normalizada.
 */
const getTodayDateString = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().split("T")[0];
};

/**
 * Obtiene todas las métricas necesarias para el dashboard de administración.
 * @returns {Promise<Object>} Datos agregados del dashboard admin.
 */
export const getAdminDashboardStats = async () => {
  try {
    const monthsWindowSize = 12;

    const totalsQuery = `
      SELECT
        (SELECT COUNT(*) FROM usuario WHERE esta_activo = TRUE) AS total_users,
        (SELECT COUNT(*) FROM cabana WHERE esta_activo = TRUE) AS total_cabins,
        (SELECT COUNT(*) FROM zonas WHERE esta_activa = TRUE) AS total_zones,
        (
          SELECT COALESCE(SUM(monto), 0)
          FROM pago
          WHERE esta_activo = TRUE
            AND date_trunc('month', fecha_pago) = date_trunc('month', CURRENT_DATE)
        ) AS current_month_revenue
    `;

    const revenueSeriesQuery = `
      SELECT
        EXTRACT(YEAR FROM fecha_pago)::int AS year,
        EXTRACT(MONTH FROM fecha_pago)::int AS month,
        SUM(monto) AS total
      FROM pago
      WHERE esta_activo = TRUE
        AND fecha_pago >= date_trunc('month', CURRENT_DATE) - (($1::int - 1) * INTERVAL '1 month')
      GROUP BY year, month
      ORDER BY year, month
    `;

    const paymentDistributionQuery = `
      SELECT
        mp.nom_medio_pago AS method,
        COUNT(*) AS count
      FROM pago p
      INNER JOIN medio_pago mp ON p.id_medio_pago = mp.id_medio_pago
      WHERE p.esta_activo = TRUE
        AND date_trunc('month', p.fecha_pago) = date_trunc('month', CURRENT_DATE)
      GROUP BY mp.nom_medio_pago
      ORDER BY COUNT(*) DESC
    `;

    const [totalsResult, revenueRowsResult, paymentDistributionResult] = await Promise.all([
      pool.query(totalsQuery),
      pool.query(revenueSeriesQuery, [monthsWindowSize]),
      pool.query(paymentDistributionQuery),
    ]);

    const totalsRow = totalsResult.rows[0] || {};
    const currentMonthRevenue = toNumber(totalsRow.current_month_revenue);

    const monthsWindow = buildMonthsWindow(monthsWindowSize);
    const revenueMap = new Map();
    revenueRowsResult.rows.forEach((row) => {
      const monthKey = `${row.year}-${String(row.month).padStart(2, "0")}`;
      revenueMap.set(monthKey, toNumber(row.total));
    });

    const revenueLast12Months = monthsWindow.map(({ year, month, key }) => ({
      year,
      month,
      total: revenueMap.get(key) ?? 0,
    }));

    const paymentTotal = paymentDistributionResult.rows.reduce(
      (acc, row) => acc + toNumber(row.count),
      0
    );

    const currentMonthPaymentMethodsDistribution = paymentDistributionResult.rows.map((row) => {
      const count = toNumber(row.count);
      const percentage = paymentTotal > 0 ? Number(((count / paymentTotal) * 100).toFixed(2)) : 0;
      return {
        method: row.method,
        count,
        percentage,
      };
    });

    return {
      totalUsers: toNumber(totalsRow.total_users),
      totalCabins: toNumber(totalsRow.total_cabins),
      totalZones: toNumber(totalsRow.total_zones),
      currentMonthRevenue,
      revenueLast12Months,
      currentMonthPaymentMethodsDistribution,
    };
  } catch (error) {
    console.error("Error al obtener métricas del dashboard admin:", error);
    throw new Error("ERROR_ADMIN_DASHBOARD_STATS");
  }
};

/**
 * Obtiene las métricas operativas del día para operadores/administradores.
 * @param {Object} options - Opciones del cálculo.
 * @param {string|null} options.referenceDate - Fecha YYYY-MM-DD a evaluar (si se omite usa hoy).
 * @returns {Promise<Object>} Datos agregados del dashboard de operador.
 */
export const getOperatorDashboardStats = async ({ referenceDate = null } = {}) => {
  try {
    const today = referenceDate ?? getTodayDateString();

    const operatorQuery = `
      WITH base_reservas AS (
        SELECT
          r.id_reserva,
          r.cant_personas,
          r.check_in,
          r.check_out,
          r.esta_pagada
        FROM reserva r
        INNER JOIN estado_operativo eo ON r.id_est_op = eo.id_est_op
        WHERE eo.nom_estado NOT IN ${EXCLUDED_STATES_SQL}
      ),
      hospedados_hoy AS (
        SELECT cant_personas
        FROM base_reservas
        WHERE $1::date >= check_in
          AND $1::date < check_out
      ),
      checkins_hoy AS (
        SELECT id_reserva
        FROM base_reservas
        WHERE check_in = $1::date
      ),
      checkouts_hoy AS (
        SELECT id_reserva
        FROM base_reservas
        WHERE check_out = $1::date
      ),
      cabanas_ocupadas AS (
        SELECT DISTINCT cr.id_cabana
        FROM cabanas_reserva cr
        INNER JOIN cabana c ON cr.id_cabana = c.id_cabana
        INNER JOIN reserva r ON cr.id_reserva = r.id_reserva
        INNER JOIN estado_operativo eo ON r.id_est_op = eo.id_est_op
        WHERE c.esta_activo = TRUE
          AND $1::date >= r.check_in
          AND $1::date < r.check_out
          AND eo.nom_estado NOT IN ${EXCLUDED_STATES_SQL}
      )
      SELECT
        (SELECT COALESCE(SUM(cant_personas), 0) FROM hospedados_hoy) AS hosted_today,
        (SELECT COUNT(*) FROM checkins_hoy) AS checkins_today,
        (SELECT COUNT(*) FROM checkouts_hoy) AS checkouts_today,
        (
          SELECT COUNT(*)
          FROM cabana
          WHERE esta_activo = TRUE
            AND en_mantenimiento = TRUE
        ) AS cabins_in_maintenance_today,
        (
          SELECT COUNT(*)
          FROM cabana
          WHERE esta_activo = TRUE
        ) AS total_cabins,
        (SELECT COUNT(*) FROM cabanas_ocupadas) AS occupied_cabins,
        (
          SELECT COUNT(*)
          FROM base_reservas
          WHERE esta_pagada = FALSE
        ) AS reservations_pending_payment
    `;

    const { rows } = await pool.query(operatorQuery, [today]);
    const metrics = rows[0] || {};

    const totalCabins = toNumber(metrics.total_cabins);
    const occupiedCabins = toNumber(metrics.occupied_cabins);
    const occupancyRate =
      totalCabins > 0 ? Number(((occupiedCabins / totalCabins) * 100).toFixed(2)) : 0;

    return {
      hostedToday: toNumber(metrics.hosted_today),
      checkinsToday: toNumber(metrics.checkins_today),
      checkoutsToday: toNumber(metrics.checkouts_today),
      cabinsInMaintenanceToday: toNumber(metrics.cabins_in_maintenance_today),
      occupancyRate,
      reservationsPendingPayment: toNumber(metrics.reservations_pending_payment),
    };
  } catch (error) {
    console.error("Error al obtener métricas del dashboard operador:", error);
    throw new Error("ERROR_OPERATOR_DASHBOARD_STATS");
  }
};
