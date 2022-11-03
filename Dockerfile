FROM public.ecr.aws/lambda/nodejs:18
COPY twingate/. ${LAMBDA_TASK_ROOT}
RUN npm install
CMD [ "app.handler" ]