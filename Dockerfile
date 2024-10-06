FROM node:18

WORKDIR /workspace

COPY package.json package-lock.json ./
COPY . .

# Installer les outils Node.js globaux
RUN npm install -g nodemon

# Installer les dépendances de l'application
RUN npm install --force
RUN npm install bcryptjs

# Install necessary dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk-bridge2.0-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxi6 \
    libxtst6 \
    libnss3 \
    libxrandr2 \
    libasound2 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1


EXPOSE 4005
CMD ["nodemon", "bin/www"]
