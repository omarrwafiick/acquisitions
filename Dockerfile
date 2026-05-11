# FROM node:18-alpine AS base

# WORKDIR /app

# COPY package.json package-lock.json* ./

# RUN npm ci --omit=dev

# COPY . .

# USER node

# EXPOSE 3000

# ENV NODE_ENV=development

# CMD ["npm", "start"]

FROM node:20-alpine AS development

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]