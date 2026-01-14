import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedModule } from './modules/database/seeders/seed.module';
import { PlanSeederService } from './modules/database/seeders/plan-seeder.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

    const swaggerConfig = new DocumentBuilder()
    .setTitle('Subscription Management API')
    .setDescription(
      'A secure and extensible backend API for managing users, plans, and subscriptions.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument);

  const skipSeed = process.env.SKIP_SEED === '1';

  if (!skipSeed) {
    try {
      const planSeeder = app.get(PlanSeederService);
      await planSeeder.seed();
    } catch (error) {
      console.error('❌ Error running seed:', error);
    }
  } else {
    console.log('ℹ️ SKIP_SEED=1 -> skipping automatic seeding.');
  }

  await app.listen(process.env.PORT ?? 3000);

  console.log(
    `🚀 Application running on http://localhost:${process.env.PORT ?? 3000}`,
  );
  console.log(
    `📚 Swagger docs available at http://localhost:${process.env.PORT ?? 3000}/api/docs`,
  );

}
bootstrap();
