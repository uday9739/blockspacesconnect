FROM node:18-alpine3.16
RUN apk --no-cache add jq

# copy base tsconfig
WORKDIR /blockspaces
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json ./
RUN npm install

# copy shared library
WORKDIR /blockspaces/shared
COPY shared ./
RUN npm install
#RUN npm run build

WORKDIR /blockspaces/core
COPY core/src ./src
COPY core/config ./config
COPY core/package*.json ./
COPY core/tsconfig*.json ./
COPY core/.env ./
RUN npm install
ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
RUN npm run build
CMD  export $(cat /vault/secrets/.env.secrets | xargs); export $(cat ./.env | xargs); npm start
EXPOSE 3000
