FROM node:latest

WORKDIR /app
EXPOSE 8080/tcp

CMD node ./index.js