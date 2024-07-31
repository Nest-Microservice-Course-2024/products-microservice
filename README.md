# Product Microservice

## Dev

1. Clonar repositorio
2. Instalar dependencias
3. Crear archivo `.env` basada en el `.env.template`
4. Ejecutar migración de prisma `npx prisma migrate dev`
5. Levantar el servidor de NATS
```
docker run -d --name nats-main -p 4222:4222 -p 8222:8222 nats
```
6. Ejecutar `npm run start:dev`