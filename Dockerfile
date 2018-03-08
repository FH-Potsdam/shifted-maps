FROM node:8

# Install ruby
RUN apt-get update -qq
RUN apt-get install -y ruby-dev rubygems build-essential make

# Install compass
RUN gem install sass -v 3.4.25
RUN gem install compass

# Install gulp and bower
RUN npm install -g bower gulp forever

# Set the working directory to /app
WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY bower.json ./
COPY .bowerrc ./

RUN npm install
RUN bower --allow-root install

# Copy the current directory contents into the container at /app
ADD . /app

RUN gulp browserify compass compress

# Expose used port
EXPOSE 3000

# Start server
CMD [ "forever", "app.js"]
