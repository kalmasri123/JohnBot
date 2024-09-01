FROM node:20.5.0
WORKDIR /app
RUN chown -R node:node /app
USER node
COPY --chown=node:node ./src ./src/
COPY --chown=node:node package*.json ./
COPY --chown=node:node tsconfig*.json ./
RUN npm install
ENV PORT=3001
ENV GOOGLE_APPLICATION_CREDENTIALS=google_credentials.json  
CMD ["npm", "start"]