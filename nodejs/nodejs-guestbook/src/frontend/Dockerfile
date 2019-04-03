FROM docker.io/node:8

WORKDIR /frontend

RUN apt-get update
RUN apt-get install -y curl build-essential

COPY package*.json ./

RUN npm install
RUN npm install @google-cloud/profiler
RUN npm install @opencensus/nodejs
RUN npm install @opencensus/exporter-stackdriver
RUN npm install @opencensus/core

COPY . .

EXPOSE 8080

CMD ["npm", "--inspect=9229", "start"]