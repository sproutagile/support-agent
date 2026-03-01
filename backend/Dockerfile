FROM node:20-alpine

WORKDIR /app

# Copy package files and install production dependencies only
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Copy application source
COPY server.js ./
COPY src/ ./src/

EXPOSE 5000

CMD ["node", "server.js"]
