import { DataSource } from 'typeorm';
import 'dotenv/config';
import { join } from 'path';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: ['src/modules/database/migrations/*.ts'],
  synchronize: false,
});
