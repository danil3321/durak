# Используем более новую версию Node.js
FROM node:20

# Устанавливаем рабочую директорию
WORKDIR /usr/src/app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

RUN npm install -g npm@latest

# Обновляем npm до последней версии
RUN npm install -g npm@latest

# Копируем остальной код
COPY . .

# Открываем порт 3000
EXPOSE 3000

# Команда запуска приложения
CMD ["node", "server.js"]
