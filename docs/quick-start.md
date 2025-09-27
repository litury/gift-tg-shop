# Быстрый запуск для разработчиков

## Требования
- Node.js 18+
- Docker
- TUNA CLI (для туннелей)

## Настройка за 7 шагов

### 1. Переменные окружения
```bash
cp .env.example .env
# Отредактируйте .env с вашими токенами
```

### 2. Базы данных (Терминал 1)
```bash
docker compose -f docker-compose.dev.yaml up mongodb redis
```

### 3. API Server (Терминал 2)
```bash
cd server
npm install
npm run dev
# Запустится на http://localhost:4000
```

### 4. Web App (Терминал 3)
```bash
cd client  
npm install
npm run dev
# Запустится на http://localhost:3000 (или следующий свободный)
```

### 5. Туннель для сервера (Терминал 4)
```bash
TUNA_TOKEN=your_token tuna http localhost:4000 --subdomain=local-tuna-server
# Получите: https://local-tuna-server.ru.tuna.am
```

### 6. Туннель для клиента (Терминал 5)
```bash
TUNA_TOKEN=your_token tuna http localhost:3000 --subdomain=local-tuna-client
# Получите: https://local-tuna-client.ru.tuna.am
```

### 7. Telegram Bot (Терминал 6)
```bash
cd bot
npm install
npm run dev
```

## Обновите .env с туннелями
```bash
WEBAPP_URL=https://local-tuna-client.ru.tuna.am
SERVER_URL=https://local-tuna-server.ru.tuna.am
VITE_API_URL=https://local-tuna-server.ru.tuna.am
```

## Тестирование
1. Найдите бота в Telegram
2. `/start`
3. Нажмите "Open Gift Shop"
4. Web App откроется в Telegram

## Отладка

### Проверка портов
```bash
curl http://localhost:4000  # Server
curl http://localhost:3000  # Client
```

### Проверка туннелей  
```bash
curl https://local-tuna-server.ru.tuna.am
curl https://local-tuna-client.ru.tuna.am
```

### Логи
- Server: смотрите в терминале 2
- Client: смотрите в терминале 3  
- Bot: смотрите в терминале 6