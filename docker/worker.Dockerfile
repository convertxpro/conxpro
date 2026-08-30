FROM node:20-bullseye-slim

RUN apt-get update && apt-get install -y \
    ffmpeg \
    libreoffice-core \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-impress \
    fonts-noto \
    fonts-noto-cjk \
    fonts-noto-urdu \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

ENV NODE_ENV=production
CMD ["npm", "run", "worker"]
