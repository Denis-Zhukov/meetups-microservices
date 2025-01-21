FROM node:20 AS builder

WORKDIR /app

COPY ./packages/meetups .

RUN yarn install

RUN npx prisma generate

RUN yarn build

FROM node:20-slim AS production

WORKDIR /app

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/fonts /app/fonts

RUN apt-get update -y && apt-get install -y openssl

EXPOSE 3000

CMD ["node", "dist/main.js"]