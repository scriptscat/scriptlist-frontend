ARG BASEIMAGE=node:20-alpine3.16

FROM ${BASEIMAGE}

EXPOSE 3000

WORKDIR /www

COPY . .

CMD [ "npm","start" ]