import express from "express";

const app = express();
const PORT = process.env.PORT || 5;

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "API online" });
});

app.listen(PORT, () => {
  console.log(`API lista en http://localhost:${PORT}`);
});