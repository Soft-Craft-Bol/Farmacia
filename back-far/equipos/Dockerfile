FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ./src ./src
COPY ./prisma ./prisma
RUN npx prisma generate
EXPOSE 4000
CMD ["node", "src/server.js"]
