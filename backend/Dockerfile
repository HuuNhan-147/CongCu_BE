# =========================
# Base Image
# Sử dụng Node.js version 20 bản nhẹ (alpine) để giảm dung lượng image
# =========================
FROM node:20-alpine

# =========================
# Thiết lập thư mục làm việc
# Tạo thư mục /app trong container và set làm thư mục chính
# =========================
WORKDIR /app

# =========================
# Copy file cấu hình dependencies
# Copy package.json và package-lock.json để tận dụng cache Docker
# =========================
COPY package*.json ./

# =========================
# Cài đặt dependencies
# Cài toàn bộ thư viện cần thiết cho backend
# =========================
RUN npm install

# =========================
# Copy source code
# Copy toàn bộ source code từ máy local vào container
# =========================
COPY . .

# =========================
# Mở port
# Khai báo container sẽ sử dụng port 5000 (API backend)
# =========================
EXPOSE 5000

# =========================
# Chạy ứng dụng
# Khởi chạy server Node.js với file entry point là server.js
# =========================
CMD ["node", "server.js"]