# Use Node.js official image
FROM node:18

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the server code
COPY . .

# Expose the backend port
EXPOSE 4000

# Start the server
CMD ["node", "server.js"]

