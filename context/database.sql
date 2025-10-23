-- =====================================================================
-- Resort de Cabañas - Esquema completo (PostgreSQL 14+)
-- Respeta el DER provisto (14 entidades)
-- =====================================================================

BEGIN;

-- =====================================================================
-- 1) TIPOS ENUM
-- =====================================================================
-- Nota: estos tipos se usan como dominio en las tablas de catálogo.
--       Los catálogos guardan su "nombre" usando el ENUM para asegurar dominio finito.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rol_usuario_enum') THEN
    CREATE TYPE rol_usuario_enum AS ENUM ('Cliente','Operador','Administrador');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_cabana_enum') THEN
    CREATE TYPE tipo_cabana_enum AS ENUM ('Esencial','Confort','Premium');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_operativo_enum') THEN
    CREATE TYPE estado_operativo_enum AS ENUM ('Cancelada','Confirmada','No aparecio','Finalizada');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'medio_pago_enum') THEN
    CREATE TYPE medio_pago_enum AS ENUM ('Efectivo','Tarjeta de débito','Tarjeta de crédito');
  END IF;
END $$;

-- =====================================================================
-- 2) TABLAS DE CATÁLOGO (con ENUM)
-- =====================================================================

-- (10) ROL_USUARIO
CREATE TABLE IF NOT EXISTS rol_usuario (
  id_rol_usuario SERIAL PRIMARY KEY,
  nom_rol        rol_usuario_enum NOT NULL UNIQUE
);

-- (2) TIPO_CABAÑA
CREATE TABLE IF NOT EXISTS tipo_cabana (
  id_tipo_cab   SERIAL PRIMARY KEY,
  nom_tipo_cab  tipo_cabana_enum NOT NULL UNIQUE,
  capacidad     INTEGER NOT NULL CHECK (capacidad > 0),
  precio_noche  NUMERIC(10,2) NOT NULL CHECK (precio_noche >= 0),
  esta_activo   BOOLEAN NOT NULL DEFAULT TRUE
);


-- (6) ESTADO_OPERATIVO
CREATE TABLE IF NOT EXISTS estado_operativo (
  id_est_op   SERIAL PRIMARY KEY,
  nom_estado  estado_operativo_enum NOT NULL UNIQUE
);

-- (12) MEDIO_PAGO
CREATE TABLE IF NOT EXISTS medio_pago (
  id_medio_pago SERIAL PRIMARY KEY,
  nom_medio_pago medio_pago_enum NOT NULL UNIQUE
);

-- (14) ZONAS
CREATE TABLE IF NOT EXISTS zonas (
  id_zona             SERIAL PRIMARY KEY,
  nom_zona            VARCHAR(200) NOT NULL UNIQUE,
  capacidad_cabanas   INTEGER NOT NULL CHECK (capacidad_cabanas >= 0),
  esta_activa         BOOLEAN NOT NULL DEFAULT TRUE
);

-- (8) SERVICIOS
CREATE TABLE IF NOT EXISTS servicios (
  id_servicio   SERIAL PRIMARY KEY,
  nom_servicio  VARCHAR(200) NOT NULL UNIQUE,
  precio_servicio NUMERIC(10,2) NOT NULL CHECK (precio_servicio >= 0)
);

-- =====================================================================
-- 3) TABLAS TRANSACCIONALES Y DE AUDITORÍA
-- =====================================================================

-- (9) USUARIO
CREATE TABLE IF NOT EXISTS usuario (
  id_usuario           SERIAL PRIMARY KEY,
  nombre               VARCHAR(200) NOT NULL,
  email                VARCHAR(320) NOT NULL UNIQUE,
  password             VARCHAR(255) NOT NULL,
  telefono             VARCHAR(50),              -- NULLABLE
  dni                  VARCHAR(50),              -- NULLABLE
  id_rol_usuario       INTEGER NOT NULL REFERENCES rol_usuario(id_rol_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
  esta_activo          BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_creacion       TIMESTAMPTZ NOT NULL,
  id_usuario_creacion  INTEGER     REFERENCES usuario(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
  id_usuario_modific   INTEGER     REFERENCES usuario(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
  fecha_modific        TIMESTAMPTZ
);

-- (1) CABAÑA
CREATE TABLE IF NOT EXISTS cabana (
  id_cabana            SERIAL PRIMARY KEY,
  cod_cabana           VARCHAR(50) NOT NULL UNIQUE,
  id_tipo_cab          INTEGER NOT NULL REFERENCES tipo_cabana(id_tipo_cab) ON DELETE RESTRICT ON UPDATE CASCADE,
  id_zona              INTEGER NOT NULL REFERENCES zonas(id_zona) ON DELETE RESTRICT ON UPDATE CASCADE,
  esta_activo          BOOLEAN NOT NULL DEFAULT TRUE,
  en_mantenimiento     BOOLEAN NOT NULL DEFAULT FALSE,
  fecha_creacion       TIMESTAMPTZ NOT NULL,
  id_usuario_creacion  INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
  id_usuario_modific   INTEGER     REFERENCES usuario(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
  fecha_modific        TIMESTAMPTZ
);

-- (4) RESERVA
CREATE TABLE IF NOT EXISTS reserva (
  id_reserva           SERIAL PRIMARY KEY,
  cod_reserva          VARCHAR(50) NOT NULL UNIQUE,
  check_in             DATE NOT NULL,
  check_out            DATE NOT NULL,
  cant_personas        INTEGER NOT NULL CHECK (cant_personas > 0),
  id_est_op            INTEGER NOT NULL REFERENCES estado_operativo(id_est_op) ON DELETE RESTRICT ON UPDATE CASCADE,
  esta_pagada          BOOLEAN NOT NULL DEFAULT FALSE,
  monto_total_res      NUMERIC(10,2) NOT NULL CHECK (monto_total_res >= 0),
  monto_pagado         NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (monto_pagado >= 0),
  fecha_creacion       TIMESTAMPTZ NOT NULL,
  id_usuario_creacion  INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
  id_usuario_modific   INTEGER     REFERENCES usuario(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
  fecha_modific        TIMESTAMPTZ
);

-- (11) PAGO
CREATE TABLE IF NOT EXISTS pago (
  id_pago              SERIAL PRIMARY KEY,
  fecha_pago           TIMESTAMPTZ NOT NULL,
  monto                NUMERIC(10,2) NOT NULL CHECK (monto > 0),
  id_medio_pago        INTEGER NOT NULL REFERENCES medio_pago(id_medio_pago) ON DELETE RESTRICT ON UPDATE CASCADE,
  id_reserva           INTEGER NOT NULL REFERENCES reserva(id_reserva) ON DELETE RESTRICT ON UPDATE CASCADE,
  esta_activo          BOOLEAN NOT NULL DEFAULT TRUE,
  id_usuario_creacion  INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
  id_usuario_modific   INTEGER     REFERENCES usuario(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
  fecha_modific        TIMESTAMPTZ
);

-- (13) CONSULTA
CREATE TABLE IF NOT EXISTS consulta (
  id_consulta          SERIAL PRIMARY KEY,
  nom_cli              VARCHAR(200) NOT NULL,
  email_cli            VARCHAR(320) NOT NULL,
  titulo               VARCHAR(250),
  mensaje_cli          TEXT NOT NULL,
  fecha_consulta       TIMESTAMPTZ NOT NULL,
  esta_respondida      BOOLEAN NOT NULL DEFAULT FALSE,
  respuesta_op         TEXT,
  id_usuario_respuesta INTEGER REFERENCES usuario(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
  fecha_respuesta      TIMESTAMPTZ
);

-- (5) CABAÑAS_RESERVA (N:M entre CABAÑA y RESERVA)
CREATE TABLE IF NOT EXISTS cabanas_reserva (
  id_cab_res  SERIAL PRIMARY KEY,
  id_cabana   INTEGER NOT NULL REFERENCES cabana(id_cabana) ON DELETE RESTRICT ON UPDATE CASCADE,
  id_reserva  INTEGER NOT NULL REFERENCES reserva(id_reserva) ON DELETE RESTRICT ON UPDATE CASCADE,
  UNIQUE (id_cabana, id_reserva)
);

-- (7) SERVICIO_RESERVA (N:M entre SERVICIOS y RESERVA)
CREATE TABLE IF NOT EXISTS servicio_reserva (
  id_serv_res SERIAL PRIMARY KEY,
  id_reserva  INTEGER NOT NULL REFERENCES reserva(id_reserva) ON DELETE RESTRICT ON UPDATE CASCADE,
  id_servicio INTEGER NOT NULL REFERENCES servicios(id_servicio) ON DELETE RESTRICT ON UPDATE CASCADE,
  UNIQUE (id_reserva, id_servicio)
);

-- =====================================================================
-- 4) PRECARGA DE VALORES EN CATÁLOGOS BASADOS EN ENUM
--     (id autoincremental + nombre con ENUM) 
-- =====================================================================

INSERT INTO rol_usuario (nom_rol) VALUES 
  ('Cliente'), ('Operador'), ('Administrador')
ON CONFLICT (nom_rol) DO NOTHING;

INSERT INTO tipo_cabana (nom_tipo_cab, capacidad, precio_noche, esta_activo) VALUES
  ('Esencial', 2,  70000.00, TRUE),
  ('Confort',  4, 130000.00, TRUE),
  ('Premium',  6, 250000.00, TRUE)
ON CONFLICT (nom_tipo_cab) DO NOTHING;

INSERT INTO estado_operativo (nom_estado) VALUES
  ('Cancelada'), ('Confirmada')('No aparecio'), ('Finalizada')
ON CONFLICT (nom_estado) DO NOTHING;

INSERT INTO medio_pago (nom_medio_pago) VALUES
  ('Efectivo'), ('Tarjeta de débito'), ('Tarjeta de crédito')
ON CONFLICT (nom_medio_pago) DO NOTHING;

COMMIT;

-- =====================================================================
-- FIN DEL SCRIPT
-- =====================================================================
