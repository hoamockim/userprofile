ARG node_version=17-alpine3.12

FROM node:17-alpine3.12 as builder

ARG SERVICE_TYPE

ENV SERVICE_NAME = "userprofile"
RUN echo $SERVICE_TYPE

WORKDIR /userprofile/
COPY . .

RUN npm install && \
    npm run build

ENTRYPOINT npm start
