# Módulo de Servicios - Kallma Resort

## 📋 Descripción

Módulo para gestionar los servicios adicionales que se pueden incluir en las reservas del resort (Gimnasio, SPA, Restaurante, etc.).

## 🎯 Características

- **Listado público**: Los clientes pueden consultar servicios sin autenticación (flujo de reserva)
- **CRUD completo**: Administradores pueden crear, actualizar y eliminar servicios
- **Validación de integridad**: No permite eliminar servicios que tienen reservas asociadas
- **Información de uso**: Muestra cuántas reservas han utilizado cada servicio

## 🔐 Niveles de Acceso

| Rol | Permisos |
|-----|----------|
| **Público** | Listar servicios disponibles |
| **Cliente** | Listar servicios disponibles |
| **Operador** | Ver detalles de servicios |
| **Admin** | CRUD completo |

## 📡 Endpoints

### 1. Listar Servicios
```
GET /api/servicios
```
**Acceso**: Público (sin autenticación)

**Respuesta exitosa (200)**:
```json
{
  "ok": true,
  "data": [
    {
      "id_servicio": 1,
      "nom_servicio": "Gimnasio",
      "precio_servicio": "15000.00"
    },
    {
      "id_servicio": 2,
      "nom_servicio": "SPA",
      "precio_servicio": "30000.00"
    }
  ],
  "total": 2
}
```

### 2. Obtener Detalle de Servicio
```
GET /api/servicios/:id
```
**Acceso**: Operador / Admin

**Respuesta exitosa (200)**:
```json
{
  "ok": true,
  "data": {
    "id_servicio": 1,
    "nom_servicio": "Gimnasio",
    "precio_servicio": "15000.00",
    "total_reservas": "5"
  }
}
```

### 3. Crear Servicio
```
POST /api/servicios
```
**Acceso**: Solo Admin

**Body**:
```json
{
  "nom_servicio": "Piscina",
  "precio_servicio": 20000
}
```

**Respuesta exitosa (201)**:
```json
{
  "ok": true,
  "message": "Servicio creado exitosamente",
  "data": {
    "id_servicio": 4,
    "nom_servicio": "Piscina",
    "precio_servicio": "20000.00"
  }
}
```

### 4. Actualizar Servicio
```
PATCH /api/servicios/:id
```
**Acceso**: Solo Admin

**Body** (campos opcionales):
```json
{
  "nom_servicio": "Gimnasio Premium",
  "precio_servicio": 18000
}
```

**Respuesta exitosa (200)**:
```json
{
  "ok": true,
  "message": "Servicio actualizado exitosamente",
  "data": {
    "id_servicio": 1,
    "nom_servicio": "Gimnasio Premium",
    "precio_servicio": "18000.00"
  }
}
```

### 5. Eliminar Servicio
```
DELETE /api/servicios/:id
```
**Acceso**: Solo Admin

**Validaciones**:
- El servicio no debe tener reservas asociadas
- Si tiene reservas, retorna error 400

**Respuesta exitosa (200)**:
```json
{
  "ok": true,
  "message": "Servicio eliminado exitosamente",
  "data": {
    "id_servicio": 4,
    "nom_servicio": "Piscina",
    "precio_servicio": "20000.00"
  }
}
```

## ⚠️ Validaciones

### Crear Servicio
- `nom_servicio`: Obligatorio, string, máximo 200 caracteres, único
- `precio_servicio`: Obligatorio, número >= 0

### Actualizar Servicio
- Al menos un campo debe ser enviado
- Los campos enviados deben cumplir las mismas validaciones que crear
- El nombre no puede duplicarse con otros servicios

### Eliminar Servicio
- No puede tener reservas asociadas en `servicio_reserva`

## 🔄 Flujo de Integración con Reservas

1. **Cliente consulta disponibilidad de cabañas** (sin login)
2. **Cliente selecciona cabañas**
3. **Cliente consulta servicios disponibles** → `GET /api/servicios` (público)
4. **Cliente selecciona servicios** (checkbox en frontend)
5. **Cliente se autentica** (login/registro)
6. **Cliente crea reserva** → `POST /api/reservas` con array de `servicios_ids`

## 📊 Cálculo de Precios

El precio de los servicios se calcula en el módulo de Reservas:

```
Precio Servicios = precio_servicio × noches × cant_personas
```

**Nota**: El precio es POR PERSONA POR NOCHE según modelo de negocio.

## 🗂️ Estructura del Módulo

```
servicios/
├── controllers/
│   └── servicio.controller.js
├── routes/
│   └── servicio.routes.js
├── schemas/
│   └── servicio.schemas.js
├── services/
│   └── servicio.service.js
├── index.js
└── README.md
```

## 🔧 Tecnologías

- **Node.js** + Express
- **PostgreSQL** (pool de conexiones)
- **Validación manual** con schemas personalizados

## 📝 Notas Importantes

- ✅ Endpoint de listado es **PÚBLICO** para facilitar el flujo del cliente
- ✅ No tiene borrado lógico (tabla no tiene campo `esta_activo`)
- ✅ Eliminación física solo si no tiene reservas asociadas
- ✅ Los precios se almacenan con 2 decimales (NUMERIC 10,2)
- ✅ Los nombres son únicos (case-insensitive)
