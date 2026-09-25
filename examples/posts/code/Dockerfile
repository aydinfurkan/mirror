FROM node:20-alpine AS base
WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev && npm install tsx@^4.16.0

COPY tsconfig.json ./
COPY src ./src

ENV PORT=3000
EXPOSE 3000
CMD ["npx", "tsx", "src/main.ts"]
