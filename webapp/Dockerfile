FROM node:boron
# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install --silent
# Bundle app source
COPY . /usr/src/app
RUN npm run-script build:prod
EXPOSE 80
CMD [ "node", "server.js" ]