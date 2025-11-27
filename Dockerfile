FROM node:18

WORKDIR /app

# Копіюємо файли залежностей
COPY package*.json ./
COPY prisma ./prisma/

# Встановлюємо залежності
RUN npm install

# Генеруємо Prisma Client
RUN npx prisma generate

# Копіюємо весь код
COPY . .

EXPOSE 3000

# Команда запуску
CMD ["sh", "-c", "npx prisma migrate deploy && npm run dev"]