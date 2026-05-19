import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../../../app.module';
import { SeedRunnerService } from '../seed.runner.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const seedRunner = app.get(SeedRunnerService);

  await seedRunner.run();

  await app.close();
}

void bootstrap();
