FROM node:14-buster-slim AS build
WORKDIR /app

COPY package*.json ./   
RUN npm install
COPY . .                
RUN npm run build

FROM node:14-buster-slim AS runtime

# RUN apk --no-cache -U upgrade
RUN mkdir -p /home/node/app/dist && mkdir -p /home/node/app/server/.ts-node && chown -R node:node /home/node/app
WORKDIR /home/node/app

COPY package*.json ./
USER node

RUN npm install --only=production
COPY --chown=node:node --from=build /app/build ./build
COPY --chown=node:node --from=build /app/server/.ts-node ./server/.ts-node

EXPOSE 3000

ENTRYPOINT ["node", "/home/node/app/server/.ts-node/index.js"]

