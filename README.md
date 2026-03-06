# Мини-сервис URL Shortener & Preview

Приложение по сокращению ссылок + предпросмотр метаданных страницы (Open Graph).

## Что реализовано по ТЗ

### 1) Frontend

- Форма для ввода длинного URL.
- После отправки отображается:
  - короткая ссылка;
  - карточка метаданных (`Title`, `Description`, `Image`).
- Обработка состояний: `loading`, `error`, `success`.
- Валидация URL на клиенте.

### 2) Backend

- API на Node.js + Express:
  - принимает URL;
  - генерирует короткий идентификатор;
  - парсит Open Graph теги страницы (`og:title`, `og:description`, `og:image`).
- Поддержан редирект по короткой ссылке (`302`).
- Валидация URL на сервере.

### 3) Storage

- Реализовано на Prisma ORM + SQLite (это покрывает и базовое требование, и пункт "будет плюсом").

### 4) Стек

- Frontend: React + Vite
- Backend: Node.js + Express
- ORM/DB: Prisma + SQLite

## Структура проекта

- `frontend` — React-приложение (форма + карточка предпросмотра)
- `backend` — Express API, редиректы, парсинг метаданных
- `backend/prisma` — Prisma schema и миграции

## Требования

- Node.js >= 16.14
- npm

## Быстрый запуск

### 1. Установить зависимости

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Проверить `.env` файлы

Backend (`backend/.env`):

```env
PORT=3001
FRONTEND_ORIGIN=http://127.0.0.1:5173,http://localhost:5173
```

Frontend (`frontend/.env`):

```env
VITE_API_BASE_URL=http://localhost:3001
```

### 3. Запустить backend

Первый запуск (создать/применить миграции):

```bash
cd backend
npm run prisma:migrate -- --name init
```

Обычный запуск:

```bash
npm run dev
```

Backend: `http://localhost:3001`

### 4. Запустить frontend

В отдельном терминале:

```bash
cd frontend
npm run dev
```

Frontend: `http://127.0.0.1:5173`

## Переменные окружения

- Backend:
  - `PORT` (по умолчанию `3001`)
  - `FRONTEND_ORIGIN` (через запятую, например `http://127.0.0.1:5173,http://localhost:5173`)
- Frontend:
  - `VITE_API_BASE_URL` (по умолчанию `http://localhost:3001`)

`backend` загружает `.env` автоматически через `dotenv`, `frontend` — через встроенную поддержку Vite.

## API контракт

### `POST /api/shorten`

Request:

```json
{
  "url": "https://example.com"
}
```

Response:

```json
{
  "id": "a1b2c3d",
  "shortUrl": "http://localhost:3001/a1b2c3d",
  "preview": {
    "title": "Example",
    "description": "Example description",
    "image": "https://example.com/image.jpg"
  }
}
```

Ошибки:

- `400` — невалидный URL (`{ "error": "..." }`)
- `500` — внутренняя ошибка API

### `GET /:id`

- Ищет короткий идентификатор.
- Возвращает `302 redirect` на оригинальный URL.
- `404`, если id не найден.

## Проверка (smoke test)

### 1) Сокращение ссылки

```bash
curl -X POST http://localhost:3001/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url":"https://react.dev/"}'
```

### 2) Проверка редиректа

```bash
curl -I http://localhost:3001/<shortId>
```

### 3) Проверка валидации

```bash
curl -X POST http://localhost:3001/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url":"not-a-url"}'
```

## Примечания по реализации

- Если сайт не отдает метаданные или блокирует парсинг, сервис все равно создает short URL и возвращает fallback preview.
- Prisma миграции лежат в `backend/prisma/migrations`.
- Логика разделена по слоям: `routes` / `services` / `components`.
