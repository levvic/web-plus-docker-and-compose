import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const PORT = process.env.SERVER_PORT || 4000;
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );

  await app.listen(PORT);
}
bootstrap();
