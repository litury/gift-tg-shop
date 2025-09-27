# Telegram Gift Shop

Telegram Web App для покупки и отправки криптовалютных подарков.

## Архитектура

Проект состоит из трех основных компонентов:

- **Bot** - Telegram бот (Grammy.js)
- **Client** - Vue.js PWA Web App
- **Server** - Express.js API
- **Databases** - MongoDB и Redis

## Структура проекта

```
gift-tg-shop/
├── bot/              # Telegram Bot (Grammy.js)
├── client/           # Web App (Vue.js + Vite)
├── server/           # API Server (Express + TypeScript)
├── docker-compose.yaml         # Production
├── docker-compose.dev.yaml     # Development
└── .env.example      # Пример переменных окружения
```

## Предварительные требования

- Node.js 18+
- Docker и Docker Compose
- TUNA CLI (для туннелей в разработке)

## Локальный запуск

### Шаг 1: Настройка переменных окружения

1. Скопируйте `.env.example` в `.env` в корне проекта:
```bash
cp .env.example .env
```

2. Заполните обязательные переменные в `.env`:
```bash
# Токены
BOT_TOKEN=your_bot_token
CRYPTO_PAY_API_TOKEN=your_crypto_pay_token
TUNA_TOKEN=your_tuna_token

# Базы данных
MONGODB_URI=mongodb://root:640436123qwe@localhost:27017/giftshop?authSource=admin
MONGO_ROOT_USERNAME=root
MONGO_ROOT_PASSWORD=640436123qwe
REDIS_PASSWORD=1234568

# JWT
JWT_SECRET=your-jwt-secret

# Поддержка
SUPPORT_CHAT_ID=your_telegram_chat_id
```

### Шаг 2: Запуск баз данных

В терминале 1:
```bash
docker compose -f docker-compose.dev.yaml up mongodb redis
```

### Шаг 3: Запуск API сервера

В терминале 2:
```bash
cd server
npm install
npm run dev
```

### Шаг 4: Запуск клиента

В терминале 3:
```bash
cd client
npm install
npm run dev
```
Клиент автоматически найдет свободный порт (обычно 3000, 3001 или 3002).

### Шаг 5: Настройка туннелей (для Telegram бота)

В терминале 4 (туннель для сервера):
```bash
TUNA_TOKEN=your_tuna_token tuna http localhost:4000 --subdomain=local-tuna-server
```

В терминале 5 (туннель для клиента):
```bash
TUNA_TOKEN=your_tuna_token tuna http localhost:XXXX --subdomain=local-tuna-client
```
Где `XXXX` - порт, на котором запустился клиент.

### Шаг 6: Обновление переменных окружения

Обновите `.env` с URL туннелей:
```bash
WEBAPP_URL=https://local-tuna-client.ru.tuna.am
SERVER_URL=https://local-tuna-server.ru.tuna.am
VITE_API_URL=https://local-tuna-server.ru.tuna.am
WEBHOOK_DOMAIN=https://local-tuna-server.ru.tuna.am
```

### Шаг 7: Запуск бота

В терминале 6:
```bash
cd bot
npm install
npm run dev
```

## Тестирование

1. Найдите вашего бота в Telegram
2. Отправьте команду `/start`
3. Нажмите кнопку "Open Gift Shop"
4. Web App должно открыться внутри Telegram

## Режим разработки

Для удобства разработки рекомендуется использовать локальный режим:

- Базы данных в Docker
- Приложения запущены локально с hot reload
- TUNA туннели для доступа из Telegram

## Технологии

### Клиент (Vue.js Web App)
- Vue 3 + TypeScript
- Tailwind CSS + DaisyUI
- Vue Router + Pinia
- Vite
- Telegram Web App SDK

### Сервер (Express.js API)
- Node.js + TypeScript
- Express.js
- MongoDB + Mongoose
- Redis + IORedis
- JWT Authentication
- Socket.IO
- Crypto Pay API

### Бот (Telegram Bot)
- Grammy.js
- Node.js + TypeScript
- Polling режим (для разработки)

### Инфраструктура
- Docker + Docker Compose
- TUNA туннели (для разработки)
- MongoDB + Redis в контейнерах

## Production Deployment

Для продакшн развертывания:
```bash
docker compose -f docker-compose.yaml up -d
```

## Лицензия

MIT
