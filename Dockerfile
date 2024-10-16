FROM node:lts
WORKDIR /usr/src/app
RUN corepack enable
# Copy package.json and package-lock.json
COPY . .

# Install dependencies
RUN pnpm i -r -v

# Build the React app
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "server/src/index.js"]
