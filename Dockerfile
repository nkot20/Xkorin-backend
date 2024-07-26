FROM node:18

WORKDIR /workspace

COPY package.json package-lock.json ./
COPY . .

# Installer les outils Node.js globaux
RUN npm install -g nodemon

# Installer les dépendances de l'application
RUN npm install --force
RUN npm install bcryptjs

EXPOSE 4005
CMD ["nodemon", "bin/www"]
