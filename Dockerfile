FROM node:20.5.0
WORKDIR /app
RUN chown -R node:node /app
USER node
COPY --chown=node:node ./src ./src/
COPY --chown=node:node package*.json ./
COPY --chown=node:node tsconfig*.json ./
COPY --chown=node:node ./cookies.json ./cookies.json
COPY --chown=node:node ./docker_dependencies/entrypoint.sh ./entrypoint.sh
RUN npm install
ENV PORT=3001
ENV GOOGLE_APPLICATION_CREDENTIALS=google_credentials.json  
CMD ["./entrypoint.sh"]