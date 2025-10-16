import express from "express";
import cors from "cors";
import { config } from "./config/index.js";
import { db } from "./config/database.js";

const app = express();
app.use(cors());
app.use(express.json());

// Health con chequeo a Postgres
app.get("/api/health", async (_req, res) => {
  try {
    const r = await db.query("SELECT * FROM estado_cabana");
    res.json({ ok: r.rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.listen(config.port, () => {
  console.log(`API lista en http://localhost:${config.port}`);
});

