import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypedConfigService } from '../config/typed-config.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (config: TypedConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: config.get('NODE_ENV') === 'development',
        logging: config.get('NODE_ENV') === 'development',
      }),
      inject: [TypedConfigService],
    }),
  ],
})
export class DatabaseModule {}
