require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');
const next = require('next');
const bot = require('./bot');

const WEB_APP_URL = process.env.WEB_APP_URL;
const BOT_TOKEN = process.env.BOT_TOKEN;
const PORT = process.env.PORT || 3000;

if (!BOT_TOKEN || !WEB_APP_URL) {
  throw new Error('BOT_TOKEN or WEB_APP_URL is not defined in .env');
}

//const bot = new Telegraf(BOT_TOKEN); // Создаем объект бота
const app = next({ dev: process.env.NODE_ENV !== 'production' }); // Настроим Next.js
const handle = app.getRequestHandler(); // Обработчик для Next.js

(async () => {
  await app.prepare();

  const server = express();

  // Middleware для обработки запросов от Telegram
  server.use(express.json());

  // Обработка запросов для бота на пути /bot
  server.post('/bot', (req, res) => {
    console.log('Received update:', req.body); // Логируем входящие обновления от Telegram
    bot.handleUpdate(req.body).catch((err) => {
      console.error('Error handling update:', err);
    });
    res.sendStatus(200); // Отправляем статус 200, чтобы Telegram знал, что запрос обработан
  });

  server.get('/nikita', (req, res) => {
    res.send('52Никита Таратынов молодец');
  });

  server.get('/danil', (req, res) => {
    res.send('Данил ебется в сраку с мужиками в душе');
  });

  // Next.js обработчик для всех остальных запросов
  server.all('*', (req, res) => {
    return handle(req, res); // Направляем все остальные запросы к Next.js
  });

  server.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);

    try {
      // Устанавливаем Webhook для бота
      await bot.telegram.setWebhook(`${WEB_APP_URL}/bot`); // Вебхук будет на /bot
      console.log('Webhook successfully set');
    } catch (err) {
      console.error('Error setting webhook:', err);
    }
  });
})();
