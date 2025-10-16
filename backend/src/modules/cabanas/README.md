# 🏠 Módulo de Cabañas

## Estructura

```
cabanas/
├── controllers/          # Controladores HTTP
│   └── cabana.controller.js
├── services/            # Lógica de negocio
│   └── cabana.service.js
├── repositories/        # Opcional: Acceso a datos
│   └── cabana.repository.js
├── routes/              # Definición de rutas
│   └── cabana.routes.js
├── middlewares/         # Middlewares específicos del módulo
│   └── cabana.middleware.js
├── schemas/             # Validación de DTOs
│   └── cabana.schemas.js
├── mappers/             # Opcional: Transformación de datos
│   └── cabana.mapper.js
└── index.js             # Exporta rutas del módulo
```

## Responsabilidades

### Controllers
- Manejar requests/responses HTTP
- Validar datos de entrada usando schemas
- Llamar a services
- Manejar errores y respuestas

### Services
- Contener lógica de negocio
- Interactuar con la base de datos (o repositories)
- Lanzar errores de negocio
- Coordinar operaciones complejas

### Repositories (Opcional)
- Abstraer queries de base de datos
- Útil para queries complejas o reutilizables
- Mantener SQL separado de la lógica de negocio

### Routes
- Definir endpoints del módulo
- Aplicar middlewares (auth, validación)
- Vincular con controllers

### Middlewares
- Validaciones específicas del módulo
- Lógica que se ejecuta antes de controllers

### Schemas
- Validar DTOs de entrada
- Definir reglas de validación
- Retornar errores claros

### Mappers (Opcional)
- Transformar entidades de DB a DTOs
- Formatear respuestas
- Limpiar datos sensibles

## Endpoints Sugeridos

- `GET /api/cabanas` - Listar cabañas (con filtros)
- `GET /api/cabanas/:id` - Ver detalle de cabaña
- `POST /api/cabanas` - Crear cabaña (Admin)
- `PUT /api/cabanas/:id` - Actualizar cabaña (Admin/Operador)
- `DELETE /api/cabanas/:id` - Eliminar cabaña (Admin)
- `GET /api/cabanas/disponibles` - Ver cabañas disponibles para fechas

## Permisos

- **Cliente**: Ver cabañas activas y disponibles
- **Operador**: Ver todas + cambiar estado
- **Administrador**: Control total
