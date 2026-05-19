import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../../../app.module';
import { PlanSeederService } from '../services/plan.seeder.service';
import { PlanPriceSeederService } from '../services/plan-price.seeder.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const planSeeder = app.get(PlanSeederService);
  const planPriceSeeder = app.get(PlanPriceSeederService);

  await planSeeder.seed();
  await planPriceSeeder.seed();

  await app.close();
}

void bootstrap();
