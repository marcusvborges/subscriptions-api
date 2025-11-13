import { Module } from '@nestjs/common';
import { HashService } from './hash.service';

@Module({
  providers: [
    {
      provide: 'HashService',
      useClass: HashService,
    },
  ],
  exports: ['HashService'],
})
export class HashModule {}
