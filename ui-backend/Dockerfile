FROM node:lts-alpine3.14
RUN apk --no-cache add jq
COPY ./src /app/src
COPY app.js /app/app.js
COPY ./config /app/config
COPY ./package*.json /app/
COPY ./bin /app/bin
COPY ./protos /app/protos
WORKDIR /app
RUN mkdir logs
RUN npm install
CMD ["npm","start"]
EXPOSE 3000