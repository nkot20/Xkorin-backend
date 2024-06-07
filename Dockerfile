# Utiliser l'image Node.js officielle
FROM node:14

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4005

CMD ["node", "./bin/www"]
