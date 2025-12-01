# syntax=docker/dockerfile:1

ARG NODE_VERSION=24.10.0

FROM node:${NODE_VERSION}-alpine

# Download openssl for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Сopy package and prisma files
COPY package*.json ./
COPY prisma ./prisma/

# Add --omit=dev for npm ci to run without dev dependencies
RUN npm ci && npx prisma generate

# Run the application as a non-root user.
USER node

# Copy the rest of the source files into the image.
COPY . .

# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
CMD ["npm", "run", "dev"]