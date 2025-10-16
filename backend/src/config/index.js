import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: Number(process.env.PORT || 4000),
  env: process.env.NODE_ENV || "development",
  jwt: {
    secret: process.env.JWT_SECRET || "tu-clave-secreta-super-segura-cambiar-en-produccion",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  db: {
    host: process.env.PGHOST || "localhost",
    port: Number(process.env.PGPORT || 5432),
    database: process.env.PGDATABASE || "mi_resort",
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD || "postgres",
  },
};
