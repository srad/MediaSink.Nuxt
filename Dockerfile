
FROM node:22-bookworm AS build

WORKDIR /app

COPY ./package.json /app/
COPY ./package-lock.json /app/

RUN npm install -g npm@latest
RUN npm install

ADD . /app

ARG VERSION
ARG BUILD

ENV VITE_BUILD=$BUILD
ENV VITE_VERSION=$VERSION

RUN npm run build

# Create a new stage for the production image
FROM node:22-bookworm

# Set the working directory inside the container
WORKDIR /app

# Copy the output from the build stage to the working directory
COPY --from=build /app/.output .
COPY --from=build /app/.nuxt .

ENV HOST=0.0.0.0 NODE_ENV=production
ENV NODE_ENV=production

ENV NUXT_APP_NAME=""
ENV NUXT_API_URL=""
ENV NUXT_BASE_URL=""
ENV NUXT_SOCKET_URL=""
ENV NUXT_FILE_URL=""

ENV NUXT_PUBLIC_APP_NAME=""
ENV NUXT_PUBLIC_API_URL=""
ENV NUXT_PUBLIC_BASE_URL=""
ENV NUXT_PUBLIC_SOCKET_URL=""
ENV NUXT_PUBLIC_FILE_URL=""

ENV PORT=80

# Expose the port the application will run on
EXPOSE 80

# Start the application
ENTRYPOINT ["node","/app/server/index.mjs"]
