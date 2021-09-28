FROM node:16-alpine as dependencies
LABEL MAINTAINER="Yang Gao <yang.gao@centrality.ai>"
ENV workdir /app

WORKDIR ${workdir}
COPY package*.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:16-alpine as builder
LABEL MAINTAINER="Yang Gao <yang.gao@centrality.ai>"
ENV workdir /app
WORKDIR ${workdir}
COPY . .
COPY --from=dependencies ${workdir}/node_modules ./node_modules
RUN yarn build

FROM node:16-alpine as runner
LABEL MAINTAINER="Yang Gao <yang.gao@centrality.ai>"
ENV workdir /app

WORKDIR ${workdir}
ENV NODE_ENV production

COPY --from=builder ${workdir}/next.config.js ./
COPY --from=builder ${workdir}/public ./public
COPY --from=builder ${workdir}/.next ./.next
COPY --from=builder ${workdir}/node_modules ./node_modules
COPY --from=builder ${workdir}/package.json ./package.json

EXPOSE 3000
CMD ["yarn", "start"]