# Stage 1: Build the React app
FROM node:16 AS build

WORKDIR /app

# Копируем package.json и package-lock.json (если используется)
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы, включая .env.production
COPY . .

# Собираем приложение с использованием .env.production
RUN NODE_ENV=production npm run build

# Stage 2: Serve the build using Nginx
FROM nginx:alpine

# Копируем собранное приложение в директорию Nginx
COPY --from=build /app/build /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf


# Открываем порт для Nginx
EXPOSE 80

# Запускаем Nginx
CMD ["nginx", "-g", "daemon off;"]