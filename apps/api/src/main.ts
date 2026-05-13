import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app/app.module';
import { ApiExceptionFilter } from './common/http/api-exception.filter';
import { attachRequestId } from './common/http/request-id.middleware';
import { configureSwagger } from './common/openapi/swagger';

export async function createApp() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.use(attachRequestId);
  app.useGlobalFilters(new ApiExceptionFilter());
  configureSwagger(app);

  return app;
}

async function bootstrap() {
  const app = await createApp();
  const port = process.env.PORT || 3333;
  await app.listen(port);
  Logger.log(
    `POS_BlueCoral API dang chay tai http://localhost:${port}/api`,
  );
}

if (require.main === module) {
  void bootstrap();
}
