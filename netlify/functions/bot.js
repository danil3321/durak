const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.on('text', (ctx) => {
  ctx.reply('Привет! Я получил твоё сообщение.');
});

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    await bot.handleUpdate(body);
    return {
      statusCode: 200,
      body: 'OK',
    };
  } catch (err) {
    console.error('Ошибка обработки Webhook:', err);
    return {
      statusCode: 500,
      body: 'Internal Server Error',
    };
  }
};
