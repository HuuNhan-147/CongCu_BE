# =========================
# Stage 1: Cài dependencies
# =========================
# Dùng Node.js bản nhẹ (Alpine)
FROM node:20-alpine AS deps

# Cài thư viện cần thiết cho bcrypt và module native
RUN apk add --no-cache python3 make g++

# Thư mục làm việc trong container
WORKDIR /app

# Copy file cấu hình trước để tận dụng cache
COPY package.json package-lock.json ./

# Cài toàn bộ thư viện (nhanh và đúng version)
RUN npm ci --frozen-lockfile


# =========================
# Stage 2: Chạy production
# =========================
# Tạo image chạy thật
FROM node:20-alpine AS runner

# Thông tin mô tả container
LABEL maintainer="CongCu Team"
LABEL description="Backend API - Node.js"

# Cài thư viện cần cho runtime + tool xử lý signal
RUN apk add --no-cache libstdc++ dumb-init

# Tạo user thường (không dùng root để bảo mật)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs

# Thư mục làm việc
WORKDIR /app

# Copy thư viện từ stage deps
COPY --from=deps --chown=nodeuser:nodejs /app/node_modules ./node_modules

# Copy source code
COPY --chown=nodeuser:nodejs . .

# Xoá file .env để bảo mật (dùng env từ docker-compose)
RUN rm -f .env

# Chạy bằng user thường
USER nodeuser

# Mở port backend
EXPOSE 5000

# Healthcheck (cần endpoint /api/health tồn tại)
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

# Giúp container shutdown đúng cách
ENTRYPOINT ["dumb-init", "--"]

# Lệnh chạy server
CMD ["node", "server.js"]