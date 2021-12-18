FROM node:16-alpine3.14

EXPOSE 3000

WORKDIR /www

COPY ./dist/ssr .

RUN npm i

ENTRYPOINT [ "node","index.js" ]