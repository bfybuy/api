FROM node:16.18.0-alpine as builder

LABEL description="BFYBUY API Docker Image"

WORKDIR /app

COPY --chown=node:node package*.json ./

# set default node env
# to be able to run tests (for example in CI), do not set production as environment
ENV NODE_ENV=staging

ENV NPM_CONFIG_LOGLEVEL=warn

# install application dependencies here, for better reuse of layers
RUN npm install

COPY --chown=node:node ./ .

# build application
RUN npm run build

RUN apk add -U --no-cache --allow-untrusted udev ttf-freefont chromium git

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

ENV CHROMIUM_PATH /usr/bin/chromium-browser

USER node

EXPOSE 8888

ENV PORT 8888

CMD [ "node", "build/server.js" ]