# ============================================================
# Stage 1: Dependencies
# ============================================================
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files để cache layer
COPY package.json package-lock.json ./

# Cài tất cả dependencies (bao gồm devDependencies cho build)
RUN npm ci --frozen-lockfile

# ============================================================
# Stage 2: Builder - Build React app
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy node_modules từ deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy toàn bộ source code
COPY . .

# Inject build-time env (VITE_API_URL sẽ được truyền vào lúc build)
ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=$VITE_API_URL

# Build production bundle
RUN npm run build

# ============================================================
# Stage 3: Production - Serve với Nginx
# ============================================================
FROM nginx:1.27-alpine AS runner

# Thêm metadata
LABEL maintainer="CongCu Team"
LABEL description="Frontend - React + Vite served by Nginx"

# Xoá config mặc định của nginx
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy cấu hình nginx tuỳ chỉnh
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copy build output từ builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
