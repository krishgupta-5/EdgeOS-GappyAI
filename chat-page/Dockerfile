FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --legacy-peer-deps

COPY . .

COPY .env.production .env.production

ENV NODE_ENV=production

RUN npm run build

EXPOSE 3000

CMD ["npm","start"]