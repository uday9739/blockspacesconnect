FROM node:18-alpine3.16
RUN apk --no-cache add jq

# copy base tsconfig
WORKDIR /blockspacesconnect
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json ./
COPY shared ./
RUN npm install

WORKDIR /blockspacesconnect/admin-api
COPY src ./src
COPY package*.json ./
COPY tsconfig*.json ./
COPY shared ./
RUN npm install
ARG API_URL
ARG HOST_URL
ARG GOOGLE_CLIENT_ID
RUN ls -al
RUN npm run build
CMD  export $(cat /vault/secrets/.env.secrets | xargs); export $(cat ./.env | xargs); npm start
EXPOSE 3000
