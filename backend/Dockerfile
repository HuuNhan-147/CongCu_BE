# =========================
# Base Image
# =========================
FROM node:20-alpine        # Sử dụng Node.js version 20 bản nhẹ (alpine) để giảm dung lượng image

# =========================
# Thiết lập thư mục làm việc
# =========================
WORKDIR /app              # Tạo thư mục /app trong container và set làm thư mục chính

# =========================
# Cài đặt dependencies
# =========================
COPY package*.json ./     # Copy package.json và package-lock.json vào container

RUN npm install           # Cài đặt tất cả thư viện cần thiết cho backend

# =========================
# Copy source code
# =========================
COPY . .                  # Copy toàn bộ source code vào container

# =========================
# Mở port
# =========================
EXPOSE 5000               # Khai báo container sẽ chạy ở port 5000 (backend API)

# =========================
# Chạy ứng dụng
# =========================
CMD ["node", "server.js"] # Khởi chạy server Node.js (file entry point là server.js)