const express = require('express');
const next = require('next');
const bot = require('./bot');

const app = next({ dev: process.env.NODE_ENV !== 'production' });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

(async () => {
    await app.prepare();
    const server = express();

    // Обработка запросов Telegraf
    server.use(bot.webhookCallback('/bot'));

    // Настройка вебхука для бота
    bot.telegram.setWebhook(`http://localhost:${PORT}/bot`);

    // Обработка Next.js
    server.all('*', (req, res) => {
        return handle(req, res);
    });

    server.listen(PORT, () => {
        console.log(`Сервер запущен на http://localhost:${PORT}`);
    });
})();
