FROM node:20-alpine

RUN addgroup -S dimdim && adduser -S dimdim -G dimdim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev

COPY src ./src

RUN chown -R dimdim:dimdim /app

USER dimdim

ENV APP_NAME=dimdimapp \
    APP_PORT=3000 \
    NODE_ENV=production

EXPOSE 3000

CMD ["node", "src/server.js"]
