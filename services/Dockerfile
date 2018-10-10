FROM node:slim

ENV NODE_ENV=development\
    DATABASE_URL=\
    DEBUG='services'

COPY . .
RUN npm install

EXPOSE 3838

CMD ["./node_modules/.bin/babel-node", "src/index.js"]
