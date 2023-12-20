FROM node:10.16.3-buster

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ./package.json /usr/src/app/
RUN npm install && npm cache clean --force
COPY ./ /usr/src/app

ENV TZ='Asia/Ho_Chi_Minh'
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN echo haha
RUN echo "Asia/Ho_Chi_Minh" > /etc/timezone

ENV PORT 7009
EXPOSE 7009
CMD [ "npm", "start" ]
