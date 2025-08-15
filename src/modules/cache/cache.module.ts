import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { TypedConfigService } from '../config/typed-config.service';
import Redis from 'ioredis';
import { createKeyv } from '@keyv/redis';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      isGlobal: true,
      inject: [TypedConfigService],
      useFactory: async (config: TypedConfigService) => ({
        store: createKeyv(config.get('REDIS_URL')),
        ttl: 60,
      }),
    }),
  ],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (config: TypedConfigService) => {
        return new Redis(config.get('REDIS_URL'), { family: 0 });
      },
      inject: [TypedConfigService],
    },
  ],
  exports: ['REDIS_CLIENT', NestCacheModule],
})
export class CacheModule {}
