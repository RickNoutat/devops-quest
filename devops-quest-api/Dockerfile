FROM node:18-alpine
RUN apk add --no-cache python3 make g++
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install
COPY . .
EXPOSE 3001
CMD ["node", "src/index.js"]
