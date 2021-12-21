# Starting with a build environment
FROM node:14-alpine
# Setting the working directory
WORKDIR /app
# Copy dependency descriptors
COPY . /app/
# Install dependencies
RUN npm ci

CMD ["npm", "start"]
