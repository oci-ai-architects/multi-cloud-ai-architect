# Build context: examples/reference-ledgerline (the directory holding package.json).
FROM node:22-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY targets/railway ./targets/railway
ENV NODE_ENV=production
CMD ["node", "targets/railway/server.ts"]
