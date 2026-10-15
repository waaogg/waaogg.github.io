FROM node:24-alpine@sha256:44fce696f38ba8c987c4db89954051000bbd05ffd8d8659ba15ed4a8602e937f AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG PUBLIC_SITE_URL
ARG PUBLIC_WALINE_SERVER_URL
ENV PUBLIC_SITE_URL=$PUBLIC_SITE_URL PUBLIC_WALINE_SERVER_URL=$PUBLIC_WALINE_SERVER_URL
RUN npm run check && npm test && npm run build && npm run verify
FROM nginx:stable-alpine@sha256:ed84151ed2d47ef93c0939eb9b9754c6990db6092cd2081e11988a47a83d47ea
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
EXPOSE 80
