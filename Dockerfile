FROM node:10-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
CMD ["npm", "start"]
