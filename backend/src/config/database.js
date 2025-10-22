import { Pool } from "pg";
import { config } from "./index.js";

export const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
  ssl: false,
  options: '-c timezone=America/Argentina/Buenos_Aires' //Esto podria ir en .env
});


export const db = {
  query: (text, params) => pool.query(text, params),
};