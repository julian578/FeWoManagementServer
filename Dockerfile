# From the base image node
	FROM node:latest
    RUN mkdir -p /usr/src/app
	WORKDIR /usr/src/app

    RUN npm install -g nodemon
	
	# Copy all the files from your file system to the container file system
	COPY package.json /usr/src/app/
	
	# Install all dependencies
	RUN npm install
	
	# Copy other files as well
	COPY . /usr/src/app
	
	# Expose the port
	EXPOSE 3000
	
	# Command to execute when the image is instantiated
	CMD ["npm","start"]