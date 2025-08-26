# Use Node.js LTS
FROM node:20

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Build TypeScript
RUN npm run build  # Make sure package.json has "build": "tsc"

# Expose port for Back4App
EXPOSE 5000

# Start the compiled JS
CMD ["node", "dist/index.js"]  # Adjust path to your compiled entry file
