FROM node:24-slim AS builder

WORKDIR /app

# 👇 go into frontend folder
COPY client/package*.json ./client/
WORKDIR /app/client
RUN npm install

COPY client/ .
RUN npm run build

FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/client/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
