# OtoRent Frontend — PRODUCTION image (multi-stage)
# Stage 1: build the static Vite bundle. Stage 2: serve it with nginx.
# VITE_API_URL is baked in at BUILD time (Vite inlines env vars), so it is
# passed as a build-arg, not a runtime env var.
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Same-origin API path — nginx (below) proxies /api to the backend, so the
# browser never needs the backend host directly. Override at build if needed.
ARG VITE_API_URL=/api/v1
ARG VITE_APP_NAME=OtoRent
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
RUN npm run build

# ---- Stage 2: static file server -------------------------------------------
FROM nginx:alpine

# SPA + /api proxy config (see docker/nginx/prod.conf).
COPY docker/nginx/prod.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
