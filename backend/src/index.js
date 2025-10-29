import express from "express";
import cors from "cors";
import { config } from "./config/index.js";
import { db } from "./config/database.js";

// Importar módulos
import usersModule from "./modules/users/index.js";
import zonasModule from "./modules/zonas/index.js";
import cabanasModule from "./modules/cabanas/index.js";
import reservasModule from "./modules/reservas/index.js";
import serviciosModule from "./modules/servicios/index.js";

const app = express();
app.use(cors());
app.use(express.json());

// Health con chequeo a Postgres
app.get("/api/health", async (_req, res) => {
  try {
    const r = await db.query("SELECT * FROM estado_cabana");
    res.json({ ok: true, data: r.rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Montar módulos
app.use("/api", usersModule);
app.use("/api", zonasModule);
app.use("/api", cabanasModule);
app.use("/api", reservasModule);
app.use("/api", serviciosModule);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: "Ruta no encontrada",
    path: req.path,
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error("Error no manejado:", err);
  res.status(500).json({
    ok: false,
    error: "Error interno del servidor",
    details: config.env === "development" ? err.message : undefined,
  });
});

app.listen(config.port, () => {
  console.log(`API lista en http://localhost:${config.port}`);
});

