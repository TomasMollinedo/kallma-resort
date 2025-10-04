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
    const r = await db.query("SELECT 1 AS ok");
    res.json({ ok: true, db: r.rows[0].ok === 1 });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.listen(config.port, () => {
  console.log(`API lista en http://localhost:${config.port}`);
});

