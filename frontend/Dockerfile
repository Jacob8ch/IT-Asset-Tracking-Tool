FROM node:24-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

# IMPORTANT: this is what serves React
COPY --from=builder /app/build /usr/share/nginx/html

# IMPORTANT: SPA routing fix
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]