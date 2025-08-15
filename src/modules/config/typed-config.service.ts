import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvSchema } from './env.schema'; 

@Injectable()
export class TypedConfigService {
  constructor(private readonly configService: ConfigService) {}

  get<K extends keyof EnvSchema>(key: K): EnvSchema[K] {
    return this.configService.get<EnvSchema[K]>(key)!;
  }
}
