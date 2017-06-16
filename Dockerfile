####
# Dockerfile for ContainerShip Cli
####

FROM library/node:6.11.0

MAINTAINER ContainerShip Developers <developers@containership.io>

RUN apt-get install git -y
RUN npm install yarn -g

RUN mkdir /app
ADD . /app
WORKDIR /app
RUN yarn install --ignore-engines --pure-lockfile

ENTRYPOINT ["/app/bin/cli.js"]
