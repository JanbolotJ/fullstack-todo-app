# Используем Node.js
FROM node:18

# Рабочая директория внутри контейнера
WORKDIR /app

# Копируем package.json и ставим зависимости
COPY package*.json ./
RUN npm install

# Копируем весь код
COPY . .

# Запускаем сервер
CMD ["npm", "run", "dev"]
