FROM node:lts-alpine3.14
RUN apk --no-cache add jq

# copy base tsconfig
WORKDIR /blockspaces
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install

# copy shared library
WORKDIR /blockspaces/shared
COPY shared ./
RUN npm install
RUN npm run build

# copy axios-oauth-client helper library (temporary)
WORKDIR /blockspaces/axios-oauth-client
COPY axios-oauth-client ./
RUN npm install

# copy backend/gRPC app
WORKDIR /blockspaces/backend
COPY backend/src src
COPY backend/config config
COPY backend/package*.json ./
COPY backend/tsconfig.json ./
RUN npm install
RUN npm run build

CMD ["npm","start"]
EXPOSE 50052