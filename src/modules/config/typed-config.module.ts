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
          new Logger(TypedConfigModule.name);
          process.exit(1);
        }
        return result.data;
      },
    }),
  ],
  exports: [NestConfigModule, TypedConfigService],
  providers: [TypedConfigService],
})
export class TypedConfigModule {}
