const { Telegraf } = require('telegraf');
require('dotenv').config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL;

if (!BOT_TOKEN || !WEB_APP_URL) {
    console.error("Error: BOT_TOKEN or WEB_APP_URL is not defined in the .env file");
    process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
    console.log('Received /start command');
    ctx.reply('Добро пожаловать! Нажмите кнопку ниже, чтобы открыть наш WebApp и узнать больше.', {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Открыть WebApp', web_app: { url: WEB_APP_URL } }]
            ],
        },
    }).then(() => {
        console.log('Message sent');
    }).catch((err) => {
        console.error('Error sending message:', err);
    });
});

bot.command('help', (ctx) => {
    ctx.reply('Это команда помощи!');
});

bot.catch((err, ctx) => {
    console.error(`Error for ${ctx.updateType}`, err);
});

module.exports = bot;
