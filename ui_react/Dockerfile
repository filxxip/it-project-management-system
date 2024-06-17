FROM node:20 AS base

WORKDIR /app

COPY package*.json ./
RUN npm install


FROM base AS build

COPY . .

ARG REACT_APP_API_URL

ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

FROM base AS development

COPY --from=build /app/ /app/

CMD ["npm", "start"]


FROM nginx:alpine AS production

COPY --from=build /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]