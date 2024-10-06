
FROM node:22-bookworm AS build

WORKDIR /app

COPY ./package.json /app/

## Install dependencies
RUN npm install

COPY . .

RUN npm run build

# Create a new stage for the production image
FROM node:22-bookworm

# Set the working directory inside the container
WORKDIR /app

# Copy the output from the build stage to the working directory
COPY --from=build /app/.output .

ARG APP_NAME=StreamSink
ARG API_URL
ARG BASE_URL
ARG SOCKET_URL
ARG FILE_URL

ENV HOST=0.0.0.0 NODE_ENV=production
ENV NODE_ENV=production

ENV NUXT_APP_NAME=$APP_NAME
ENV NUXT_API_URL=$API_URL
ENV NUXT_BASE_URL=$BASE_URL
ENV NUXT_SOCKET_URL=$SOCKET_URL
ENV NUXT_FILE_URL=$FILE_URL

ENV NUXT_PUBLIC_APP_NAME=$APP_NAME
ENV NUXT_PUBLIC_API_URL=$API_URL
ENV NUXT_PUBLIC_BASE_URL=$BASE_URL
ENV NUXT_PUBLIC_SOCKET_URL=$SOCKET_URL
ENV NUXT_PUBLIC_FILE_URL=$FILE_URL

ENV PORT=80

# Expose the port the application will run on
EXPOSE 80

# Start the application
CMD ["node","/app/server/index.mjs"]
