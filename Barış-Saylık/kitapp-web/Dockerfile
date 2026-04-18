# ── KitApp Web Frontend ─────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /frontend

# Önce bağımlılık dosyalarını kopyala (layer cache optimizasyonu)
COPY package*.json ./

RUN npm ci

# Kaynak kodun tamamını kopyala
COPY . .

# Docker ortamı flag'i (isteğe bağlı ortam değişkeni)
ENV DOCKER=true

EXPOSE 5173

# Vite'i dış ağa açmak için --host 0.0.0.0 zorunludur
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
