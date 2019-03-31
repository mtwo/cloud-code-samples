FROM docker.io/node:8

WORKDIR /frontend

RUN apt-get update
RUN apt-get install -y curl build-essential

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

CMD ["npm", "--inspect=9229", "start"]
