FROM node:20 AS builder

WORKDIR /app

COPY ./packages/meetups .

RUN yarn install

RUN yarn build

FROM node:20-slim AS production

WORKDIR /app

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules

RUN apt-get update -y && apt-get install -y openssl

EXPOSE 3000

CMD [ "node", "dist/src/main.js" ]
