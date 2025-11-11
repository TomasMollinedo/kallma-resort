# 💬 Módulo de Consultas

## 📋 Descripción

El módulo de Consultas permite a los visitantes de la página web enviar preguntas o comentarios al resort **sin necesidad de estar registrados**. Los operadores y administradores pueden ver, gestionar y responder estas consultas desde el sistema interno, enviando automáticamente un email al cliente con la respuesta.

---

## 📖 Documentación Completa

Para documentación detallada del módulo, consultar:
- **[MODULO_CONSULTAS.md](../../MODULO_CONSULTAS.md)** - Documentación completa
- **[EJEMPLOS_CONSULTAS.http](../../EJEMPLOS_CONSULTAS.http)** - Ejemplos de uso

---

## 🏗️ Estructura del Módulo

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

---

## 🎯 Responsabilidades

- ✅ Recibir consultas de clientes (incluso no registrados)
- ✅ Listar y filtrar consultas por estado (respondidas/pendientes)
- ✅ Mostrar detalles completos de cada consulta
- ✅ Responder consultas y enviar email automático al cliente
- ✅ Proveer estadísticas sobre consultas
- ✅ Validar datos de entrada en todos los endpoints

---

## 🛣️ Endpoints

### 1️⃣ **Crear Consulta** (Público)
```http
POST /api/consultas
```
**Acceso:** Público (sin autenticación)  
**Body:**
```json
{
  "nomCli": "María González",
  "emailCli": "maria@example.com",
  "titulo": "Consulta sobre disponibilidad",  // Opcional
  "mensajeCli": "Mensaje de al menos 10 caracteres"
}
```

**Validaciones:**
- `nomCli`: Obligatorio, mínimo 2 caracteres, máximo 200
- `emailCli`: Obligatorio, formato email válido, máximo 320
- `titulo`: Opcional, máximo 250 caracteres
- `mensajeCli`: Obligatorio, mínimo 10 caracteres, máximo 5000

---

### 2️⃣ **Listar Consultas** (Operador/Admin)
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
  - `todo`: Todas las consultas
- `busqueda`: Texto para buscar en nombre, email o título (opcional)

**Los filtros son combinables**

**Respuesta:**
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

### 3️⃣ **Obtener Detalle de Consulta** (Operador/Admin)
```http
GET /api/consultas/:id
```
**Acceso:** Operador / Administrador  
**Params:** `id` (número entero)

---

### 4️⃣ **Responder Consulta** (Operador/Admin)
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
- ✅ **Envía automáticamente un email al cliente** con:
  - Template HTML profesional
  - Consulta original del cliente
  - Respuesta del operador
  - Firma del equipo Kallma Resort

**Validaciones:**
- `respuestaOp`: Obligatorio, mínimo 10 caracteres, máximo 5000
- La consulta no debe estar ya respondida

---

### 5️⃣ **Obtener Estadísticas** (Operador/Admin)
```http
GET /api/consultas/estadisticas
```
**Acceso:** Operador / Administrador  
**Respuesta:**
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

## 🔐 Permisos

| Endpoint | Público | Cliente | Operador | Admin |
|----------|---------|---------|----------|-------|
| `POST /api/consultas` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/consultas` | ❌ | ❌ | ✅ | ✅ |
| `GET /api/consultas/:id` | ❌ | ❌ | ✅ | ✅ |
| `POST /api/consultas/:id/responder` | ❌ | ❌ | ✅ | ✅ |
| `GET /api/consultas/estadisticas` | ❌ | ❌ | ✅ | ✅ |

---

## 📊 Modelo de Datos (Base de Datos)

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

---

## 📧 Configuración del Servicio de Email

### Variables de Entorno Requeridas

Agregar al archivo `.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-password-de-aplicacion
EMAIL_FROM=tu-email@gmail.com
```

### 🔧 Configuración para Gmail

1. **Activar verificación en 2 pasos** en tu cuenta de Google
2. **Generar una contraseña de aplicación:**
   - Ve a: https://myaccount.google.com/apppasswords
   - Selecciona "Correo" y "Otro dispositivo"
   - Copia la contraseña generada
3. **Usar esa contraseña** en `EMAIL_PASSWORD` (NO tu contraseña normal)

### 📨 Template del Email

El email enviado incluye:
- **Header** con logo del resort
- **Consulta original** del cliente
- **Respuesta** del operador destacada
- **Firma** con nombre del operador
- **Footer** con información de contacto
- **Diseño responsive** para móviles

---

## 🔄 Flujo de Trabajo

### Flujo del Cliente (Público)
1. Cliente visita la página principal
2. Navega al formulario de "Contacto"
3. Completa el formulario (nombre, email, título, mensaje)
4. Envía la consulta
5. Sistema confirma recepción
6. Cliente recibe email de respuesta cuando el operador responda

### Flujo del Operador/Admin
1. Operador inicia sesión en el sistema interno
2. Ve dashboard con consultas pendientes
3. Lista consultas no respondidas (por defecto)
4. Selecciona una consulta para ver detalle
5. Escribe respuesta al cliente
6. Envía respuesta (se marca como respondida + email automático)
7. Puede ver historial de consultas respondidas

---

## 📝 Ejemplos de Uso

Ver archivo completo de ejemplos: `backend/EJEMPLOS_CONSULTAS.http`

### Ejemplo: Cliente envía consulta
```http
POST http://localhost:4000/api/consultas
Content-Type: application/json

{
  "nomCli": "María González",
  "emailCli": "maria@example.com",
  "titulo": "Consulta sobre disponibilidad",
  "mensajeCli": "Hola, me gustaría saber si tienen disponibilidad para un grupo de 12 personas del 15 al 20 de diciembre."
}
```

### Ejemplo: Operador responde
```http
POST http://localhost:4000/api/consultas/1/responder
Authorization: Bearer <token>
Content-Type: application/json

{
  "respuestaOp": "Hola María, tenemos disponibilidad para su grupo. Le recomendamos 2 cabañas Premium (capacidad 6 personas c/u)..."
}
```

---

## ⚠️ Manejo de Errores

El módulo maneja los siguientes errores:

- **400 Bad Request:** Validación de datos fallida
- **401 Unauthorized:** Token no proporcionado o inválido
- **403 Forbidden:** Usuario sin permisos (cliente intentando acceder a endpoints de staff)
- **404 Not Found:** Consulta no encontrada
- **409 Conflict:** Consulta ya respondida
- **500 Internal Server Error:** Error en base de datos o servicio de email

**Nota:** Si el email falla al enviarse, la respuesta se guarda igualmente en la BD y se registra el error en logs.

---

## 🚀 Características Especiales

✅ **Sin autenticación para crear consultas** - Cualquier visitante puede contactar  
✅ **Filtro por defecto inteligente** - Muestra solo pendientes para facilitar gestión  
✅ **Búsqueda flexible** - Busca en nombre, email o título  
✅ **Email automático profesional** - Template HTML responsive  
✅ **Estadísticas en tiempo real** - Dashboard de métricas  
✅ **Validaciones exhaustivas** - Previene datos incorrectos  
✅ **Manejo de errores robusto** - Logs detallados para debugging

---

## 📚 Dependencias Utilizadas

- **nodemailer:** Envío de emails (agregada al proyecto)
- **pg:** Cliente PostgreSQL
- **express:** Framework web
- **jsonwebtoken:** Autenticación JWT

---

## 🧪 Testing

Para probar el módulo:

1. **Usar archivo EJEMPLOS_CONSULTAS.http** con REST Client (VS Code)
2. **Postman/Insomnia:** Importar las peticiones del archivo
3. **Frontend:** Implementar formulario de contacto

---

## 📦 Instalación de Dependencias Adicionales

```bash
npm install nodemailer
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

## 🎓 Reglas de Negocio Implementadas

1. **Consultas públicas:** No requieren autenticación
2. **Respuestas privadas:** Solo staff autorizado
3. **Una respuesta por consulta:** No se puede responder dos veces
4. **Email automático:** Se envía al responder (con manejo de errores)
5. **Filtro por defecto:** Muestra pendientes para optimizar workflow
6. **Búsqueda inteligente:** Facilita encontrar consultas específicas
7. **Auditoría:** Registra quién y cuándo respondió

---

**¡El módulo está listo para ser usado! 🎉**
