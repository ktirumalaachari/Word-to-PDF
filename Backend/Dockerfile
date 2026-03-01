FROM node:18

RUN apt-get update && apt-get install -y libreoffice

WORKDIR /app

COPY Backend/package*.json ./
RUN npm install

COPY Backend .

EXPOSE 3000

CMD ["node", "index.js"]
