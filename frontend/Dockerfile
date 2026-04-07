# =========================
# Stage 1: Build React App
# =========================
FROM node:20-alpine AS builder   # Dùng Node.js bản nhẹ (alpine) để build

WORKDIR /app                     # Tạo thư mục làm việc trong container

# Copy file package để cài dependencies (tận dụng cache Docker)
COPY package*.json ./

RUN npm install                 # Cài tất cả thư viện (bao gồm devDependencies để build)

# Copy toàn bộ source code vào container
COPY . .

# Khai báo biến môi trường cho frontend (API backend)
# Vite sẽ đọc biến này khi build
ARG VITE_API_URL=https://congcu-be-backend-2-0.onrender.com/api
ENV VITE_API_URL=$VITE_API_URL

# Build project React (Vite) → tạo thư mục /dist
RUN npm run build


# =========================
# Stage 2: Serve bằng Nginx
# =========================
FROM nginx:alpine               # Dùng Nginx bản nhẹ để serve web tĩnh

# Copy file build từ stage builder sang Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy file config Nginx (để cấu hình routing, SPA, API proxy nếu có)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Mở port 80 để truy cập web
EXPOSE 80

# Chạy Nginx ở foreground (bắt buộc để container không bị tắt)
CMD ["nginx", "-g", "daemon off;"]