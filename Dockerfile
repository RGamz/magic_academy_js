#builder stage
FROM node:20-alpine AS build
WORKDIR ./
COPY package*.json ./
RUN npm install --production
COPY . .


#runtime stage
FROM node:20-alpine
WORKDIR ./
COPY --from=build . .
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "index.js"]
