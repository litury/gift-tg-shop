FROM node:20-alpine 
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости без запуска postinstall скрипта
RUN npm install --ignore-scripts

# Копируем исходные файлы
COPY . .

# Создаем директорию для статических файлов
RUN mkdir -p static/gifts

# Компилируем TypeScript в JavaScript
RUN npm run build || true

# Устанавливаем права на директории
RUN chown -R node:node /app

# Переключаемся на пользователя node
USER node

# Запускаем скомпилированное приложение
CMD ["npm", "run", "start"]