# 💬 MÓDULO DE CONSULTAS - Kallma Resort

## 📋 Tabla de Contenidos
1. [Descripción General](#descripción-general)
2. [Modelo de Datos](#modelo-de-datos)
3. [Endpoints Implementados](#endpoints-implementados)
4. [Reglas de Negocio](#reglas-de-negocio)
5. [Validaciones](#validaciones)
6. [Seguridad y Autorización](#seguridad-y-autorización)
7. [Servicio de Email](#servicio-de-email)
8. [Estructura del Código](#estructura-del-código)
9. [Ejemplos de Uso](#ejemplos-de-uso)

---

## 📖 Descripción General

El **Módulo de Consultas** permite a los visitantes de la página web enviar preguntas o comentarios al resort **sin necesidad de estar registrados**. Los operadores y administradores pueden ver, gestionar y responder estas consultas desde el sistema interno, enviando automáticamente un email al cliente con la respuesta.

### Características Principales

- ✅ **Consultas públicas**: Sin autenticación requerida
- ✅ **Email automático**: Template HTML profesional y responsive
- ✅ **Filtro inteligente**: Muestra pendientes por defecto
- ✅ **Búsqueda flexible**: Por nombre, email o título
- ✅ **Estadísticas en tiempo real**: Dashboard de métricas
- ✅ **Validaciones exhaustivas**: En todos los endpoints
- ✅ **Una sola respuesta**: No se puede responder dos veces
- ✅ **Auditoría completa**: Registra quién y cuándo respondió

---

## 🗃️ Modelo de Datos

### Tabla: `consulta`

```sql
CREATE TABLE IF NOT EXISTS consulta (
  id_consulta          SERIAL PRIMARY KEY,
  nom_cli              VARCHAR(200) NOT NULL,
  email_cli            VARCHAR(320) NOT NULL,
  titulo               VARCHAR(250),
  mensaje_cli          TEXT NOT NULL,
  fecha_consulta       TIMESTAMPTZ NOT NULL,
  esta_respondida      BOOLEAN NOT NULL DEFAULT FALSE,
  respuesta_op         TEXT,
  id_usuario_respuesta INTEGER REFERENCES usuario(id_usuario),
  fecha_respuesta      TIMESTAMPTZ
);
```

### Campos Importantes

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_consulta` | SERIAL | ID único de la consulta |
| `nom_cli` | VARCHAR(200) | Nombre del cliente |
| `email_cli` | VARCHAR(320) | Email del cliente (para respuesta) |
| `titulo` | VARCHAR(250) | Asunto de la consulta (opcional) |
| `mensaje_cli` | TEXT | Mensaje del cliente |
| `fecha_consulta` | TIMESTAMPTZ | Fecha y hora de creación |
| `esta_respondida` | BOOLEAN | Estado de la consulta |
| `respuesta_op` | TEXT | Respuesta del operador |
| `id_usuario_respuesta` | INTEGER | Usuario que respondió |
| `fecha_respuesta` | TIMESTAMPTZ | Fecha y hora de respuesta |

---

## 🛣️ Endpoints Implementados

### 1️⃣ Crear Consulta (Público)

```http
POST /api/consultas
```

**Acceso:** Público (sin autenticación)  
**Body:**
```json
{
  "nomCli": "María González",
  "emailCli": "maria@example.com",
  "titulo": "Consulta sobre disponibilidad",
  "mensajeCli": "Mensaje de al menos 10 caracteres"
}
```

**Respuesta (201):**
```json
{
  "ok": true,
  "message": "Consulta creada exitosamente. Le responderemos a la brevedad.",
  "data": {
    "id_consulta": 1,
    "nom_cli": "María González",
    "email_cli": "maria@example.com",
    "titulo": "Consulta sobre disponibilidad",
    "fecha_consulta": "2025-11-07T13:30:00.000Z"
  }
}
```

---

### 2️⃣ Listar Consultas (Staff)

```http
GET /api/consultas?estaRespondida=false&periodo=semana&busqueda=texto
```

**Acceso:** Operador / Administrador  
**Query Params:**
- `estaRespondida`: `true` o `false` (opcional, **por defecto: `false`**)
  - `true`: Solo consultas respondidas
  - `false`: Solo consultas pendientes (valor por defecto)
  - **Sin especificar**: Muestra solo pendientes (comportamiento por defecto)
- `periodo`: `"hoy"`, `"semana"`, `"mes"`, `"todo"` (por defecto: `"todo"`)
  - `hoy`: Consultas de hoy desde las 00:00
  - `semana`: Últimos 7 días
  - `mes`: Últimos 30 días
  - `todo`: Todas las consultas del período
- `busqueda`: Texto para buscar en nombre, email o título (opcional)

**Nota:** Los filtros son combinables. Ejemplos:
- `?estaRespondida=false&periodo=hoy` - Pendientes de hoy
- `?estaRespondida=true&periodo=mes` - Respondidas del último mes
- `?periodo=semana&busqueda=María` - Todas las de la semana que contengan "María"

**Respuesta (200):**
```json
{
  "ok": true,
  "data": [
    {
      "id_consulta": 1,
      "nom_cli": "María González",
      "email_cli": "maria@example.com",
      "titulo": "Consulta sobre disponibilidad",
      "mensaje_cli": "...",
      "fecha_consulta": "2025-11-07T13:30:00.000Z",
      "esta_respondida": false,
      "respuesta_op": null,
      "fecha_respuesta": null,
      "id_usuario_respuesta": null,
      "nombre_operador": null
    }
  ],
  "total": 1,
  "filtros": {
    "periodo": "todo",
    "busqueda": "texto"
  }
}
```

---

### 3️⃣ Obtener Detalle de Consulta (Staff)

```http
GET /api/consultas/:id
```

**Acceso:** Operador / Administrador  
**Params:** `id` (número entero)

**Respuesta (200):**
```json
{
  "ok": true,
  "data": {
    "id_consulta": 1,
    "nom_cli": "María González",
    "email_cli": "maria@example.com",
    "titulo": "Consulta sobre disponibilidad",
    "mensaje_cli": "...",
    "fecha_consulta": "2025-11-07T13:30:00.000Z",
    "esta_respondida": false,
    "respuesta_op": null,
    "fecha_respuesta": null,
    "id_usuario_respuesta": null,
    "nombre_operador": null,
    "email_operador": null
  }
}
```

---

### 4️⃣ Responder Consulta (Staff)

```http
POST /api/consultas/:id/responder
```

**Acceso:** Operador / Administrador  
**Body:**
```json
{
  "respuestaOp": "Respuesta del operador con mínimo 10 caracteres"
}
```

**Funcionalidad:**
- ✅ Marca la consulta como respondida
- ✅ Guarda la respuesta y el usuario que respondió
- ✅ Registra fecha y hora de respuesta
- ✅ **Envía automáticamente un email al cliente**

**Respuesta (200):**
```json
{
  "ok": true,
  "message": "Consulta respondida exitosamente. Se ha enviado un email al cliente.",
  "data": {
    "id_consulta": 1,
    "nom_cli": "María González",
    "email_cli": "maria@example.com",
    "titulo": "Consulta sobre disponibilidad",
    "mensaje_cli": "...",
    "fecha_consulta": "2025-11-07T13:30:00.000Z",
    "esta_respondida": true,
    "respuesta_op": "Hola María, muchas gracias por contactarnos...",
    "fecha_respuesta": "2025-11-07T14:00:00.000Z",
    "id_usuario_respuesta": 2
  }
}
```

---

### 5️⃣ Obtener Estadísticas (Staff)

```http
GET /api/consultas/estadisticas
```

**Acceso:** Operador / Administrador

**Respuesta (200):**
```json
{
  "ok": true,
  "data": {
    "total_consultas": "25",
    "respondidas": "18",
    "pendientes": "7",
    "ultima_semana": "5",
    "ultimo_mes": "25"
  }
}
```

---

## 📏 Reglas de Negocio

### 1. Consultas Públicas
- No requieren autenticación
- Cualquier visitante puede enviar una consulta
- Se registra fecha y hora automáticamente

### 2. Respuestas Privadas
- Solo staff autorizado (Operador/Administrador)
- Se requiere autenticación con JWT
- Se registra quién respondió

### 3. Una Respuesta por Consulta
- No se puede responder dos veces la misma consulta
- Se valida que `esta_respondida` sea `false`
- Error 400 si ya fue respondida

### 4. Email Automático
- Se envía al responder una consulta
- Template HTML profesional
- Incluye consulta original y respuesta
- Manejo de errores: si falla, la respuesta se guarda igual

### 5. Sistema de Filtros Combinables
- `GET /api/consultas` muestra solo **consultas pendientes** por defecto
- **Filtro por estado**: `estaRespondida` (por defecto: `false` - solo pendientes)
  - `true`: Solo respondidas
  - `false`: Solo pendientes (valor por defecto)
  - Para ver todas: usar endpoint sin el parámetro y modificar el controller
- **Filtro por período**: `hoy`, `semana`, `mes`, `todo` (por defecto: `todo`)
- **Filtro por búsqueda**: Busca en nombre, email o título
- **Combinables**: Todos los filtros se pueden usar simultáneamente
- Ordenadas por fecha más reciente primero

### 6. Búsqueda Inteligente
- Busca en: nombre, email o título
- Case-insensitive
- Usa operador ILIKE de PostgreSQL

### 7. Auditoría
- Registra `id_usuario_respuesta`
- Registra `fecha_respuesta`
- Permite trazabilidad completa

---

## ✅ Validaciones

### Crear Consulta

| Campo | Validación |
|-------|------------|
| `nomCli` | Obligatorio, 2-200 caracteres |
| `emailCli` | Obligatorio, formato RFC 5322, máx 320 caracteres |
| `titulo` | Opcional, máximo 250 caracteres |
| `mensajeCli` | Obligatorio, 10-5000 caracteres |

### Filtros de Listado

| Parámetro | Validación |
|-----------|------------|
| `estaRespondida` | Booleano opcional: `true`, `false` (por defecto: `false` - solo pendientes) |
| `periodo` | Enum: `"hoy"`, `"semana"`, `"mes"`, `"todo"` (por defecto: `"todo"`) |
| `busqueda` | String opcional, máximo 200 caracteres |

**Nota:** Los tres filtros son independientes y combinables entre sí.  
**Comportamiento por defecto:** Sin parámetros, muestra solo consultas pendientes de todos los tiempos.

### Responder Consulta

| Campo | Validación |
|-------|------------|
| `respuestaOp` | Obligatorio, 10-5000 caracteres |

### Regex para Email
```javascript
/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
```

---

## 🔐 Seguridad y Autorización

### Tabla de Permisos

| Endpoint | Público | Cliente | Operador | Admin |
|----------|---------|---------|----------|-------|
| `POST /api/consultas` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/consultas` | ❌ | ❌ | ✅ | ✅ |
| `GET /api/consultas/:id` | ❌ | ❌ | ✅ | ✅ |
| `POST /api/consultas/:id/responder` | ❌ | ❌ | ✅ | ✅ |
| `GET /api/consultas/estadisticas` | ❌ | ❌ | ✅ | ✅ |

### Middlewares Utilizados

- **`authenticate`**: Valida token JWT
- **`requireStaff`**: Valida rol (Operador o Administrador)

---

## 📧 Servicio de Email

### Configuración

**Archivo:** `backend/src/utils/email.service.js`

**Variables de Entorno:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-password-de-aplicacion
EMAIL_FROM=tu-email@gmail.com
```

### Configuración para Gmail

1. **Activar verificación en 2 pasos**
2. **Generar contraseña de aplicación:**
   - https://myaccount.google.com/apppasswords
   - Seleccionar "Correo" y "Otro dispositivo"
   - Copiar la contraseña generada
3. **Usar esa contraseña** en `EMAIL_PASSWORD`

### Template del Email

El email incluye:
- **Header** con logo del resort
- **Consulta original** del cliente
- **Respuesta** del operador destacada
- **Firma** con nombre del operador
- **Footer** con información de contacto
- **Diseño responsive** para móviles

### Funciones Disponibles

```javascript
// Enviar respuesta a consulta
await enviarRespuestaConsulta(
  consulta.email_cli,
  consulta.nom_cli,
  consulta.mensaje_cli,
  respuestaOp,
  nombreOperador
);

// Enviar email de prueba
await enviarCorreoPrueba(destinatario);
```

---

## 🏗️ Estructura del Código

```
consultas/
├── controllers/
│   └── consulta.controller.js      # Maneja peticiones HTTP
├── services/
│   └── consulta.service.js         # Lógica de negocio y queries SQL
├── routes/
│   └── consulta.routes.js          # Definición de endpoints
├── schemas/
│   └── consulta.schemas.js         # Validación de datos
└── index.js                         # Exporta rutas del módulo
```

### Flujo de una Petición

```
Cliente → Routes → Controller → Schemas (validación) → Service → Base de Datos
                                                      → Email Service
```

### Arquitectura por Capas

1. **Routes**: Define endpoints y middlewares
2. **Controller**: Valida entrada, maneja respuestas HTTP
3. **Schemas**: Valida formato de datos
4. **Service**: Lógica de negocio, queries SQL, envío de emails
5. **Database**: PostgreSQL con pool de conexiones

---

## 📝 Ejemplos de Uso

### Flujo Completo: Cliente hace Consulta y Recibe Respuesta

#### Paso 1: Cliente envía consulta (sin login)
```http
POST http://localhost:4000/api/consultas
Content-Type: application/json

{
  "nomCli": "Roberto Sánchez",
  "emailCli": "roberto.s@example.com",
  "titulo": "Consulta sobre fechas navideñas",
  "mensajeCli": "Buenos días, quisiera saber si tienen disponibilidad para 2 cabañas del 24 al 27 de diciembre. Somos 8 adultos y 2 niños. ¿Cuál sería el costo aproximado? Gracias."
}
```

#### Paso 2: Operador lista consultas pendientes
```http
GET http://localhost:4000/api/consultas
Authorization: Bearer {{token}}
```

#### Paso 3: Operador ve el detalle
```http
GET http://localhost:4000/api/consultas/3
Authorization: Bearer {{token}}
```

#### Paso 4: Operador responde la consulta
```http
POST http://localhost:4000/api/consultas/3/responder
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "respuestaOp": "Hola Roberto, gracias por su consulta. Tenemos disponibilidad para las fechas solicitadas. Para 8 adultos y 2 niños, le recomendamos 2 cabañas Premium. El costo total sería $1,500,000. ¿Le gustaría proceder con la reserva?"
}
```

#### Paso 5: Cliente recibe email automático
El sistema envía automáticamente un email con:
- Consulta original
- Respuesta del operador
- Información de contacto del resort

---

## 🔄 Flujo de Trabajo

### Flujo del Cliente
1. Visita la página principal
2. Va al formulario de contacto
3. Completa datos (nombre, email, mensaje)
4. Envía la consulta
5. Recibe confirmación en pantalla
6. Recibe email de respuesta cuando el operador responda

### Flujo del Operador
1. Inicia sesión en el sistema
2. Ve dashboard con consultas pendientes
3. Lista consultas no respondidas (por defecto)
4. Selecciona una consulta
5. Lee el detalle completo
6. Escribe respuesta
7. Envía respuesta (marca como respondida + email automático)
8. Puede ver historial de consultas respondidas

---

## ⚠️ Manejo de Errores

| Código | Descripción |
|--------|-------------|
| 400 | Validación de datos fallida |
| 401 | Token no proporcionado o inválido |
| 403 | Usuario sin permisos (cliente intentando acceder a endpoints de staff) |
| 404 | Consulta no encontrada |
| 409 | Consulta ya respondida |
| 500 | Error en base de datos o servicio de email |

**Nota Importante:** Si el email falla al enviarse, la respuesta se guarda igualmente en la base de datos y se registra el error en los logs. Esto garantiza que la información no se pierda.

---

## 🧪 Testing

Ver ejemplos completos en: **`EJEMPLOS_CONSULTAS.http`**

### Herramientas Recomendadas
1. **REST Client** (VS Code extension)
2. **Postman**
3. **Insomnia**

---

## 📦 Dependencias

```json
{
  "nodemailer": "^6.9.7",
  "pg": "^8.16.3",
  "express": "^5.1.0",
  "jsonwebtoken": "^9.0.2"
}
```

---

## ✅ Checklist de Implementación

- [x] Service con lógica de negocio
- [x] Schemas de validación
- [x] Controller delgado
- [x] Routes con middlewares de autenticación
- [x] Index del módulo
- [x] Servicio de email (utils/email.service.js)
- [x] Configuración de email en config/index.js
- [x] Variables de entorno en .env.example
- [x] Documentación completa
- [x] Ejemplos HTTP
- [x] Montado en aplicación principal

---

**¡El módulo de consultas está 100% completo y listo para usar! 🎉**
