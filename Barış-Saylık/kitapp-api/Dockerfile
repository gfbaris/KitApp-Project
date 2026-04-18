# ── KitApp API Backend ──────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /backend

# Önce bağımlılık dosyalarını kopyala (layer cache optimizasyonu)
COPY package*.json ./

RUN npm ci

# Kaynak kodun tamamını kopyala
COPY . .

EXPOSE 5000

# Production'da node ile çalıştır (nodemon değil)
CMD ["node", "server.js"]
