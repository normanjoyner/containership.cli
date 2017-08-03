FROM mhart/alpine-node:8.2

MAINTAINER ContainerShip Developers <developers@containership.io>

RUN apk update && apk add git

WORKDIR /app
ADD . /app

RUN npm install

ENTRYPOINT ["/app/bin/cli.js"]
