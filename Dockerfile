
# Build Angular
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

# Serve Angular with Nginx
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/ /tmp/dist/

RUN set -eux; \
    INDEX_FILE="$(find /tmp/dist -name index.html -type f | head -n 1)"; \
    test -n "$INDEX_FILE"; \
    cp -a "$(dirname "$INDEX_FILE")/." /usr/share/nginx/html/; \
    rm -rf /tmp/dist

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
