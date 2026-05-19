import { Global, Logger, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { envSchema } from './env.schema';
import { TypedConfigService } from './typed-config.service';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: (env) => {
        const result = envSchema.safeParse(env);

        if (!result.success) {
          const logger = new Logger(TypedConfigModule.name);

          logger.error(
            'Invalid environment variables',
            JSON.stringify(result.error.format(), null, 2),
          );

          throw new Error('Invalid environment variables');
        }

        return result.data;
      },
    }),
  ],
  exports: [NestConfigModule, TypedConfigService],
  providers: [TypedConfigService],
})
export class TypedConfigModule {}
