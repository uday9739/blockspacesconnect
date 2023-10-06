# NOTE: the context of the container build will be the root of the repository

FROM node:18-alpine3.16

# copy base tsconfig
WORKDIR /blockspaces
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json ./
RUN npm install

# setup shared library
WORKDIR /blockspaces/shared
COPY shared ./
RUN npm install
#RUN npm run build

# copy frontend app
WORKDIR /blockspaces/frontend/connect-ui
COPY frontend/connect-ui/src src
COPY frontend/connect-ui/config config
COPY frontend/connect-ui/public public
COPY frontend/connect-ui/.npmrc .npmrc
COPY frontend/connect-ui/jsconfig.json jsconfig.json
COPY frontend/connect-ui/next-env.d.ts next-env.d.ts
COPY frontend/connect-ui/next.config.js next.config.js
COPY frontend/connect-ui/package.json package.json
COPY frontend/connect-ui/package-lock.json package-lock.json
COPY frontend/connect-ui/tsconfig.json tsconfig.json

ARG API_URL
ARG HOST_URL
ARG DEMO_LIGHTNING_NODE
ARG SERVICE_NOW_URL
ARG DATADOG_APP_ID
ARG DATADOG_CLIENT_TOKEN
ARG NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ENV API_URL=${API_URL}
ENV HOST_URL=${HOST_URL}
ENV DEMO_LIGHTNING_NODE=${DEMO_LIGHTNING_NODE}
ENV SERVICE_NOW_URL=${SERVICE_NOW_URL}
ENV DATADOG_APP_ID=${DATADOG_APP_ID}
ENV DATADOG_CLIENT_TOKEN=${DATADOG_CLIENT_TOKEN}
ENV NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY=${NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY}
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=${NEXT_PUBLIC_GA_MEASUREMENT_ID}

RUN npm install
RUN npm run build
CMD ["npm","start"]
EXPOSE 3001