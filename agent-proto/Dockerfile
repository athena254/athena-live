FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy application files
COPY *.js ./
COPY *.proto ./

EXPOSE 50051

CMD ["node", "server.js"]
