# 🏗️ Arquitectura Modular por Dominio

## 📐 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/                    # Configuración global
│   │   ├── index.js              # Config general (JWT, env, etc.)
│   │   └── database.js           # Conexión a PostgreSQL
│   │
│   ├── modules/                   # Módulos por dominio
│   │   ├── users/                # ✅ IMPLEMENTADO
│   │   │   ├── controllers/
│   │   │   │   ├── auth.controller.js
│   │   │   │   └── user.controller.js
│   │   │   ├── services/
│   │   │   │   ├── auth.service.js
│   │   │   │   └── user.service.js
│   │   │   ├── routes/
│   │   │   │   ├── auth.routes.js
│   │   │   │   └── user.routes.js
│   │   │   ├── middlewares/
│   │   │   │   └── auth.middleware.js
│   │   │   ├── schemas/
│   │   │   │   ├── auth.schemas.js
│   │   │   │   └── user.schemas.js
│   │   │   └── index.js          # Exporta rutas del módulo
│   │   │
│   │   ├── cabanas/              # 📁 ESTRUCTURA PREPARADA
│   │   │   └── README.md
│   │   ├── reservas/             # 📁 ESTRUCTURA PREPARADA
│   │   │   └── README.md
│   │   ├── pagos/                # 📁 ESTRUCTURA PREPARADA
│   │   │   └── README.md
│   │   └── consultas/            # 📁 ESTRUCTURA PREPARADA
│   │       └── README.md
│   │
│   └── index.js                   # Punto de entrada, monta módulos
│
├── .env                           # Variables de entorno
├── .env.example                   # Ejemplo de configuración
├── package.json
└── ARQUITECTURA_MODULAR.md        # Este archivo
```

---

## 🎯 Principios de la Arquitectura

### 1. **Separación por Dominio**
Cada módulo agrupa toda la lógica relacionada con un dominio de negocio específico (users, cabañas, reservas, etc.).

### 2. **Capas Claramente Definidas**

```
Request → Routes → Middlewares → Controllers → Services → Database
                                                    ↓
                                              Schemas (Validación)
```

### 3. **Responsabilidades de Cada Capa**

#### **Controllers** (`controllers/`)
- ✅ Manejar requests/responses HTTP
- ✅ Validar entrada usando schemas
- ✅ Llamar a services
- ✅ Manejar errores y formatear respuestas
- ❌ NO debe contener lógica de negocio
- ❌ NO debe acceder directamente a la base de datos

#### **Services** (`services/`)
- ✅ Contener toda la lógica de negocio
- ✅ Interactuar con la base de datos
- ✅ Coordinar operaciones complejas
- ✅ Lanzar errores de negocio claros
- ❌ NO debe saber sobre HTTP (req, res)
- ❌ NO debe formatear respuestas HTTP

#### **Routes** (`routes/`)
- ✅ Definir endpoints del módulo
- ✅ Aplicar middlewares (auth, validación)
- ✅ Vincular rutas con controllers
- ❌ NO debe contener lógica

#### **Middlewares** (`middlewares/`)
- ✅ Autenticación y autorización
- ✅ Validaciones específicas
- ✅ Lógica que se ejecuta antes de controllers

#### **Schemas** (`schemas/`)
- ✅ Validar DTOs de entrada
- ✅ Definir reglas de validación
- ✅ Retornar errores estructurados

#### **Repositories** (Opcional)
- ✅ Abstraer queries SQL complejas
- ✅ Útil para queries reutilizables
- Nota: En proyectos pequeños, los services pueden acceder directamente a la DB

#### **Mappers** (Opcional)
- ✅ Transformar entidades de DB a DTOs
- ✅ Formatear respuestas
- ✅ Limpiar datos sensibles

---

## 📦 Módulo de Ejemplo: USERS

### Flujo de una Petición

#### 1. **Request:** `POST /api/auth/register`

#### 2. **Route** (`routes/auth.routes.js`)
```javascript
router.post("/register", register);
```

#### 3. **Controller** (`controllers/auth.controller.js`)
```javascript
export const register = async (req, res) => {
  // 1. Validar entrada con schema
  const validation = validateRegisterData(req.body);
  if (!validation.isValid) {
    return res.status(400).json({ errors: validation.errors });
  }

  // 2. Llamar al service
  const result = await authService.registerUser(req.body);

  // 3. Formatear respuesta
  res.status(201).json({ ok: true, data: result });
};
```

#### 4. **Schema** (`schemas/auth.schemas.js`)
```javascript
export const validateRegisterData = (data) => {
  const errors = [];
  
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push({ field: "email", message: "Email inválido" });
  }
  
  return { isValid: errors.length === 0, errors };
};
```

#### 5. **Service** (`services/auth.service.js`)
```javascript
export const registerUser = async (userData) => {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    // Lógica de negocio
    const existingUser = await client.query(...);
    if (existingUser.rows.length > 0) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await client.query("INSERT INTO usuario...");
    
    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
```

---

## 🚀 Cómo Crear un Nuevo Módulo

### Paso 1: Crear la estructura de carpetas

```bash
mkdir -p src/modules/mi_modulo/{controllers,services,routes,middlewares,schemas}
touch src/modules/mi_modulo/index.js
```

### Paso 2: Crear el Service

```javascript
// services/mi_modulo.service.js
import { pool } from "../../../config/database.js";

export const crearItem = async (data) => {
  const result = await pool.query(
    "INSERT INTO mi_tabla (campo1, campo2) VALUES ($1, $2) RETURNING *",
    [data.campo1, data.campo2]
  );
  return result.rows[0];
};

export const obtenerItems = async (filters) => {
  const result = await pool.query("SELECT * FROM mi_tabla WHERE ...");
  return result.rows;
};
```

### Paso 3: Crear el Schema de Validación

```javascript
// schemas/mi_modulo.schemas.js
export const validateCreateData = (data) => {
  const errors = [];
  
  if (!data.campo1) {
    errors.push({ field: "campo1", message: "Campo1 es obligatorio" });
  }
  
  return { isValid: errors.length === 0, errors };
};
```

### Paso 4: Crear el Controller

```javascript
// controllers/mi_modulo.controller.js
import * as service from "../services/mi_modulo.service.js";
import { validateCreateData } from "../schemas/mi_modulo.schemas.js";

export const crear = async (req, res) => {
  try {
    const validation = validateCreateData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }
    
    const result = await service.crearItem(req.body);
    res.status(201).json({ ok: true, data: result });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

export const listar = async (req, res) => {
  try {
    const items = await service.obtenerItems(req.query);
    res.json({ ok: true, data: items });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};
```

### Paso 5: Crear las Routes

```javascript
// routes/mi_modulo.routes.js
import { Router } from "express";
import { crear, listar } from "../controllers/mi_modulo.controller.js";
import { authenticate, requireStaff } from "../../users/middlewares/auth.middleware.js";

const router = Router();

router.get("/", authenticate, listar);
router.post("/", requireStaff, crear);

export default router;
```

### Paso 6: Crear el Index del Módulo

```javascript
// index.js
import { Router } from "express";
import miModuloRoutes from "./routes/mi_modulo.routes.js";

const router = Router();
router.use("/mi-modulo", miModuloRoutes);

export default router;
```

### Paso 7: Montar el Módulo en `src/index.js`

```javascript
// src/index.js
import miModulo from "./modules/mi_modulo/index.js";

app.use("/api", miModulo);
```

---

## ✅ Ventajas de Esta Arquitectura

### 1. **Escalabilidad**
- Fácil agregar nuevos módulos sin afectar existentes
- Cada módulo es independiente

### 2. **Mantenibilidad**
- Código organizado por dominio
- Fácil encontrar y modificar código
- Responsabilidades claras

### 3. **Testeabilidad**
- Services son funciones puras (fácil testear)
- Controllers delgados
- Mocks simples

### 4. **Reutilización**
- Services pueden ser llamados desde otros módulos
- Middlewares compartibles
- Schemas reutilizables

### 5. **Separación de Concerns**
- HTTP separado de lógica de negocio
- Validación separada de procesamiento
- Base de datos abstraída

---

## 🎯 Mejores Prácticas

### ✅ DO (Hacer)

1. **Mantener controllers delgados**
   ```javascript
   // ✅ BIEN
   export const crear = async (req, res) => {
     const validation = validate(req.body);
     if (!validation.isValid) return res.status(400).json({...});
     
     const result = await service.crear(req.body);
     res.json({ ok: true, data: result });
   };
   ```

2. **Lanzar errores claros en services**
   ```javascript
   // ✅ BIEN
   if (existingUser) {
     throw new Error("EMAIL_ALREADY_EXISTS");
   }
   ```

3. **Usar transacciones para operaciones múltiples**
   ```javascript
   // ✅ BIEN
   const client = await pool.connect();
   try {
     await client.query("BEGIN");
     // ... operaciones ...
     await client.query("COMMIT");
   } catch (error) {
     await client.query("ROLLBACK");
     throw error;
   } finally {
     client.release();
   }
   ```

4. **Validar siempre la entrada**
   ```javascript
   // ✅ BIEN
   const validation = validateData(req.body);
   if (!validation.isValid) {
     return res.status(400).json({ errors: validation.errors });
   }
   ```

### ❌ DON'T (No Hacer)

1. **No poner lógica de negocio en controllers**
   ```javascript
   // ❌ MAL
   export const crear = async (req, res) => {
     const hashedPassword = await bcrypt.hash(req.body.password, 10);
     const result = await pool.query("INSERT INTO...");
     res.json(result.rows[0]);
   };
   ```

2. **No acceder a req/res en services**
   ```javascript
   // ❌ MAL
   export const crearUsuario = async (req, res) => {
     // Services NO deben saber sobre HTTP
   };
   ```

3. **No hardcodear valores**
   ```javascript
   // ❌ MAL
   const JWT_SECRET = "mi-secreto-123";
   
   // ✅ BIEN
   const JWT_SECRET = config.jwt.secret;
   ```

4. **No mezclar concerns**
   ```javascript
   // ❌ MAL - Mezclando validación, negocio y respuesta
   export const crear = async (req, res) => {
     if (!req.body.email) return res.status(400).json({...});
     const hashed = await bcrypt.hash(req.body.password, 10);
     const result = await pool.query(...);
     res.json({ ok: true, data: result.rows[0] });
   };
   ```

---

## 🔄 Migración desde Arquitectura Anterior

### Antes (Arquitectura Plana)
```
src/
├── controllers/
│   ├── auth.controller.js
│   └── user.controller.js
├── routes/
│   ├── auth.routes.js
│   └── user.routes.js
└── middlewares/
    └── auth.middleware.js
```

### Después (Arquitectura Modular)
```
src/
└── modules/
    └── users/
        ├── controllers/
        ├── services/        ← NUEVO
        ├── routes/
        ├── middlewares/
        ├── schemas/         ← NUEVO
        └── index.js         ← NUEVO
```

### Beneficios de la Migración
- ✅ Lógica de negocio extraída a services (testeable)
- ✅ Validación centralizada en schemas
- ✅ Módulo autocontenido y exportable
- ✅ Fácil agregar nuevos módulos

---

## 📚 Recursos

- **Middleware de Auth compartido**: `modules/users/middlewares/auth.middleware.js`
- **Config global**: `src/config/index.js`
- **Database pool**: `src/config/database.js`

---

## 🎓 Próximos Pasos

1. ✅ Módulo **users** completamente implementado
2. 📁 Estructura preparada para **cabañas**, **reservas**, **pagos**, **consultas**
3. 📖 Documentación en cada módulo (`README.md`)
4. 🚀 Listo para implementar nuevos módulos siguiendo el patrón

---

**La arquitectura está lista para escalar. Cada nuevo módulo seguirá el mismo patrón probado.** 🎯
