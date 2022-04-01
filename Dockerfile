FROM node:current-alpine3.15

RUN apk --no-cache add docker docker-compose
COPY . /app
RUN cd app && npm ci --production
ENTRYPOINT ["node", "/app/src/index.js"]