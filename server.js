require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');
const next = require('next');

const WEB_APP_URL = 'https://durak332.netlify.app'; // Ваш Netlify URL
const BOT_TOKEN = process.env.BOT_TOKEN; // Токен вашего бота
if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN is not defined in .env');
}

const bot = new Telegraf(BOT_TOKEN);
const app = next({ dev: process.env.NODE_ENV !== 'production' });
const handle = app.getRequestHandler();

(async () => {
  await app.prepare();

  const server = express();

  // Middleware для обработки запросов от Telegram
  server.use(express.json());

  // Telegram Webhook
  server.post('/bot', (req, res) => {
    bot.handleUpdate(req.body);
    res.sendStatus(200);
  });

  // Next.js handler для всех остальных запросов
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, async () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);

    try {
      // Устанавливаем Webhook для бота
      await bot.telegram.setWebhook(`${WEB_APP_URL}/bot`);
      console.log('Webhook успешно установлен');
    } catch (err) {
      console.error('Ошибка при установке Webhook:', err);
    }
  });
})();
