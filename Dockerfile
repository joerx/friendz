FROM node:6-alpine

ENV NODE_ENV=development

ADD . /src

WORKDIR /src

ENTRYPOINT ["/usr/local/bin/npm"]
