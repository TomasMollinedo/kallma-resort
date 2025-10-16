# 💬 Módulo de Consultas

## Estructura

```
consultas/
├── controllers/
│   └── consulta.controller.js
├── services/
│   └── consulta.service.js
├── repositories/
│   └── consulta.repository.js
├── routes/
│   └── consulta.routes.js
├── middlewares/
│   └── consulta.middleware.js
├── schemas/
│   └── consulta.schemas.js
└── index.js
```

## Responsabilidades

- Recibir consultas de clientes (incluso no registrados)
- Gestionar respuestas del staff
- Marcar consultas como respondidas

## Endpoints Sugeridos

- `POST /api/consultas` - Crear consulta (Público)
- `GET /api/consultas` - Listar consultas (Staff)
- `GET /api/consultas/:id` - Ver detalle (Staff)
- `PUT /api/consultas/:id/responder` - Responder consulta (Staff)
- `GET /api/consultas/pendientes` - Consultas sin responder (Staff)

## Permisos

- **Público**: Crear consulta (sin auth)
- **Operador**: Ver y responder consultas
- **Administrador**: Control total

## Campos Importantes

- `nom_cli`: Nombre del cliente
- `email_cli`: Email del cliente
- `titulo`: Asunto (opcional)
- `mensaje_cli`: Mensaje del cliente
- `esta_respondida`: Boolean
- `respuesta_op`: Respuesta del operador
- `id_usuario_respuesta`: Quién respondió
- `fecha_respuesta`: Cuándo se respondió
