# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Gift Telegram Shop - это Web App для Telegram, построенный на микросервисной архитектуре. Проект состоит из трех основных компонентов:

1. **Telegram Bot** - обрабатывает команды и запускает Web App
2. **Client (Web App)** - Vue.js PWA, которое открывается в Telegram
3. **Server (API)** - Node.js/Express API с TypeScript
4. **Databases** - MongoDB и Redis в Docker контейнерах

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Telegram Bot  │───▶│   Web App       │───▶│   API Server    │
│   (Node.js)     │    │   (Vue.js)      │    │   (Express)     │
│   Port: webhook │    │   Port: 3000    │    │   Port: 4000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                               ┌───────┴───────┐
                                               ▼               ▼
                                       ┌─────────────┐ ┌─────────────┐
                                       │   MongoDB   │ │    Redis    │
                                       │  Port:27017 │ │  Port:6379  │
                                       └─────────────┘ └─────────────┘
```

## Development Modes

Проект поддерживает два режима разработки:

### 1. Local Development (Рекомендуемый)
Запускает приложения локально, а базы данных в Docker:
```bash
# Запуск баз данных
docker compose -f docker-compose.dev.yaml up mongodb redis -d

# Запуск сервера (в отдельном терминале)
cd server && npm install && npm run dev

# Запуск клиента (в отдельном терминале)  
cd client && npm install && npm run dev

# Запуск бота (в отдельном терминале)
cd bot && npm install && npm run dev
```

### 2. Full Docker Development
Запускает все компоненты в Docker (требует TUNA_TOKEN для туннелей):
```bash
docker compose -f docker-compose.dev.yaml up -d
```

## Common Commands

### Development
- `npm run dev` - запуск в режиме разработки (во всех модулях)
- `npm run build` - сборка проекта (server, client)
- `npm run start` - запуск в продакшн режиме

### Database Operations
- `npm run seed:all` - заполнение базы тестовыми данными (в server/)
- `npm run seed:gifts` - заполнение подарками
- `npm run seed:leaderboard` - заполнение рейтингом
- `npm run seed:orders` - заполнение заказами

### Docker Commands
```bash
# Запуск только баз данных
docker compose -f docker-compose.dev.yaml up mongodb redis -d

# Запуск всего стека
docker compose -f docker-compose.dev.yaml up -d

# Просмотр логов
docker compose -f docker-compose.dev.yaml logs [service_name]

# Остановка
docker compose -f docker-compose.dev.yaml down
```

## Environment Variables

Проект использует файл `.env` в корне для всех компонентов. Ключевые переменные:

### Telegram Bot
- `BOT_TOKEN` - токен Telegram бота
- `BOT_USERNAME` - username бота
- `SUPPORT_CHAT_ID` - ID чата поддержки

### Web App URLs
- `WEBAPP_URL` - URL веб-приложения для бота
- `VITE_API_URL` - URL API для клиента
- `SERVER_URL` - URL сервера

### Databases
- `MONGODB_URI` - строка подключения к MongoDB
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` - настройки Redis

### Crypto Pay
- `CRYPTO_PAY_API_TOKEN` - токен для Crypto Pay API
- `VITE_CRYPTO_PAY_API_URL` - URL API Crypto Pay

## Project Structure

```
gift-tg-shop/
├── bot/              # Telegram Bot (Grammy.js)
│   ├── src/
│   │   ├── modules/  # Модули бота
│   │   └── index.ts  # Точка входа
│   └── assets/       # Статические файлы бота
├── client/           # Web App (Vue.js + Vite)
│   ├── src/
│   │   ├── modules/  # Модули по функционалу
│   │   ├── components/
│   │   └── main.ts
│   └── public/
├── server/           # API Server (Express + TypeScript)
│   ├── src/
│   │   ├── modules/  # Модули по функционалу
│   │   ├── scripts/  # Скрипты для заполнения БД
│   │   └── index.ts  # Точка входа
│   └── static/       # Статические файлы
└── docker-compose*   # Docker конфигурации
```

## Module Architecture

Все три компонента используют модульную архитектуру:

- **gifts/** - управление подарками
- **users/** - управление пользователями  
- **orders/** - обработка заказов
- **leaderboard/** - рейтинги и статистика
- **core/** - общие утилиты и сервисы
- **database/** - работа с базами данных (только server)

## Testing the Application

1. **Запустите все компоненты**:
   ```bash
   # Базы данных
   docker compose -f docker-compose.dev.yaml up mongodb redis -d
   
   # В разных терминалах:
   cd server && npm run dev
   cd client && npm run dev  
   cd bot && npm run dev
   ```

2. **Найдите бота в Telegram**: @tggiftstest_bot

3. **Отправьте команду** `/start` - бот откроет Web App

4. **Web App доступен по адресу**: http://localhost:3000

5. **API доступен по адресу**: http://localhost:4000

## Deployment

Для продакшн используйте:
```bash
docker compose -f docker-compose.yaml up -d
```

Это запустит все компоненты в продакшн режиме с оптимизированными сборками.

## Notes

- Web App работает только внутри Telegram (требует Telegram Web App API)
- Для локальной разработки используйте Telegram Desktop или мобильное приложение
- MongoDB требует аутентификации в продакшн режиме
- Redis используется для кеширования и сессий
- Все модули используют TypeScript