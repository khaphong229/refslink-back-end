FROM node:16.20.2-alpine

RUN apk add --no-cache python3 make g++ \
    && mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install && \
    npm rebuild bcrypt --build-from-source

COPY . .

RUN npm run build

EXPOSE 3111

CMD ["npm", "run", "production"]
