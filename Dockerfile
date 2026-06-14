# ——— Етап 1: збірка статичного сайту ———
FROM node:22-alpine AS build
WORKDIR /app

# Спершу маніфести залежностей — кращий кеш шарів.
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
# Домен підставляється під час білда (EasyPanel: env SITE_URL).
ARG SITE_URL
ENV SITE_URL=${SITE_URL}
RUN npm run build

# ——— Етап 2: віддача через nginx ———
FROM nginx:alpine AS runtime
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1
CMD ["nginx", "-g", "daemon off;"]
