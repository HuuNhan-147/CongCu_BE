# =========================
# Stage 1: Build React App
# Sử dụng Node.js bản nhẹ (alpine) để build project React (Vite)
# =========================
FROM node:20-alpine AS builder

# =========================
# Thiết lập thư mục làm việc
# Tạo thư mục /app trong container
# =========================
WORKDIR /app

# =========================
# Copy file cấu hình dependencies
# Copy package.json và package-lock.json để tận dụng cache Docker
# =========================
COPY package*.json ./

# =========================
# Cài đặt dependencies
# Cài toàn bộ thư viện (bao gồm devDependencies để phục vụ build)
# =========================
RUN npm install

# =========================
# Copy source code
# Copy toàn bộ source code vào container
# =========================
COPY . .

# =========================
# Khai báo biến môi trường cho frontend
# Vite sẽ sử dụng biến này khi build để gọi API backend
# =========================
ARG VITE_API_URL=https://congcu-be-backend-2-0.onrender.com/api
ENV VITE_API_URL=$VITE_API_URL

# =========================
# Build ứng dụng React
# Tạo thư mục /dist chứa file tĩnh sau khi build
# =========================
RUN npm run build


# =========================
# Stage 2: Serve bằng Nginx
# Sử dụng Nginx bản nhẹ để phục vụ web tĩnh
# =========================
FROM nginx:alpine

# =========================
# Copy file build từ stage builder
# Đưa toàn bộ file trong /dist vào thư mục public của Nginx
# =========================
COPY --from=builder /app/dist /usr/share/nginx/html

# =========================
# Copy cấu hình Nginx
# Dùng để cấu hình routing (SPA), rewrite, hoặc proxy API
# =========================
COPY nginx.conf /etc/nginx/conf.d/default.conf

# =========================
# Mở port
# Web sẽ chạy trên port 80
# =========================
EXPOSE 80

# =========================
# Chạy Nginx
# Chạy ở chế độ foreground để container không bị dừng
# =========================
CMD ["nginx", "-g", "daemon off;"]