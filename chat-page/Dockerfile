FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --legacy-peer-deps --loglevel verbose

COPY . .

EXPOSE 3001

CMD ["npm","run","dev"]