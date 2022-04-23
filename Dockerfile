FROM node:16-bullseye

RUN mkdir /app

COPY --chown=0:0 . /app

WORKDIR /app

RUN yarn install
RUN yarn build

CMD yarn start
