FROM amazon/aws-lambda-nodejs:14
COPY twingate/. ${LAMBDA_TASK_ROOT}
RUN npm install
CMD [ "app.handler" ]