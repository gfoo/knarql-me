FROM node:9.5-alpine as build

WORKDIR /app
COPY package.json /app/
RUN yarn
COPY . /app/
RUN yarn run build --build-optimizer

FROM nginx:1.13.8-alpine

COPY nginx/default.conf /etc/nginx/conf.d/
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/ /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
