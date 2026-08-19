FROM node:20-slim

# Install latest chromium and required shared libraries for Puppeteer
RUN apt-get update \
    && apt-get install -y chromium \
    libnss3 \
    libxss1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    fonts-liberation \
    libappindicator3-1 \
    xdg-utils \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer to use the installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Copy package files (we might not have a root package.json, so just copy the directories)
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm install --prefix frontend
RUN npm install --prefix backend

# Copy all source files
COPY frontend/ ./frontend/
COPY backend/ ./backend/

# Build frontend
RUN npm run build --prefix frontend

# Expose backend port
EXPOSE 5000

# Start backend server
CMD ["node", "backend/server.js"]
