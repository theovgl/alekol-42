FROM node:16

WORKDIR /usr/src

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 8080
ENV PORT 8080
CMD [ "npm", "start" ]
