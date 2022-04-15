FROM node:16

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm ci --only=production

COPY . .

ENV PORT 8080
EXPOSE 8080

CMD [ "npm", "start" ]
