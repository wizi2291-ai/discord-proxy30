FROM node:22-alpine

WORKDIR /app

COPY index.js ./

RUN npm install --omit=dev

COPY . .

ENV PORT=8080

EXPOSE 8080

CMD ["node", "index.js"]
