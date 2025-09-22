# Main Dockerfile for development
FROM node:18-alpine

WORKDIR /app

# Install dependencies for both frontend and backend
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install root dependencies
RUN npm install

# Install server dependencies
WORKDIR /app/server
RUN npm install

# Install client dependencies
WORKDIR /app/client
RUN npm install

# Copy source code
WORKDIR /app
COPY . .

# Expose ports
EXPOSE 3000 5000

# Start both servers
CMD ["npm", "run", "dev"]
