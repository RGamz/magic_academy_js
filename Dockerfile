#builder stage
FROM node:20-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --production
COPY . .


#runtime stage
FROM node:20-slim
WORKDIR /app

COPY --from=build /app ./
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "index.js"]
