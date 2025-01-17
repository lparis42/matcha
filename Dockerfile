FROM node:20-slim
WORKDIR /usr/src/app
RUN corepack enable

# Copy package.json and package-lock.json
COPY . .

# Install dependencies
RUN pnpm install -r

# Build the React app
RUN pnpm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
