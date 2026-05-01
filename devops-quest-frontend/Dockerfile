# @author Rick Noutat
FROM node:18-alpine AS build
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install
COPY . .
ARG VITE_API_URL=http://localhost:3001
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
