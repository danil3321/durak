const { Telegraf } = require('telegraf');
require('dotenv').config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL;

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
    ctx.reply('Нажмите кнопку ниже, чтобы открыть WebApp.', {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Открыть WebApp', web_app: { url: WEB_APP_URL } }]
            ],
        },
    });
});

module.exports = bot;

