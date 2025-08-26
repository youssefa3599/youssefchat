# Use Node.js LTS
FROM node:20

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your source code
COPY . .

# Expose the port your app uses
EXPOSE 5000

# Start the server using ts-node
CMD ["npm", "run", "start"]
