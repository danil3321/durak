const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Обработчик текстовых сообщений
bot.on('text', (ctx) => {
  // URL вашего веб-приложения
  const webAppUrl = 'https://durak332.netlify.app';

  // Отправляем сообщение с кнопкой WebApp
  ctx.reply('Открыть приложение:', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Перейти в WebApp',
            web_app: { url: webAppUrl }, // Ссылка на WebApp
          },
        ],
      ],
    },
  });
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