FROM node:22-alpine
LABEL name="cryptosense"

WORKDIR /usr/cryptosense

RUN apk add --update \
  && apk add --no-cache ca-certificates \
  && apk add --no-cache --virtual .build-deps curl git python3 alpine-sdk

COPY turbo.json package.json tsconfig.base.json tsconfig.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# packages package.json
COPY packages/core/package.json ./packages/core/package.json
COPY packages/db/package.json ./packages/db/package.json

# services package.json
COPY services/api/package.json ./services/api/package.json

RUN yarn workspaces focus --all

# packages
COPY packages/core ./packages/core
COPY packages/db ./packages/db

# services
COPY services/api ./services/api

RUN yarn turbo run build

RUN yarn workspaces focus --all --production

CMD ["node", "--enable-source-maps", "services/api/dist/bin.js"]
