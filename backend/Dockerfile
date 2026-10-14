FROM node:24-bookworm-slim
WORKDIR /backend
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
