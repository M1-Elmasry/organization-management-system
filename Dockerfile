#Build stage
FROM node:16-alpine AS build

WORKDIR /app

COPY package*.json  ./

RUN npm install

COPY . .

RUN npm run build

#Production stage
FROM node:16-alpine AS production

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY --from=build /app/dist ./dist

ENV SERVER_HOST=0.0.0.0
ENV DB_HOST=0.0.0.0
ENV REDIS_HOST=0.0.0.0

EXPOSE 8080

CMD ["node", "dist/server.js"]
