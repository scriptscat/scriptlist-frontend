FROM node:16-alpine3.14

EXPOSE 3000

WORKDIR /www

COPY . .

RUN npm ci && npm run build

CMD [ "npm","start" ]