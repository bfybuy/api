FROM node:18-alpine as build-stage

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY ./ .

RUN npm run build

EXPOSE 6000

ENV PORT 6000

CMD [ "npm", "run", "start" ]