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
COPY --chown=node:node --from=build /app/.ts-node ./.ts-node
COPY --chown=node:node public public

EXPOSE 3000

ENTRYPOINT ["npm", "run", "start:built"]

