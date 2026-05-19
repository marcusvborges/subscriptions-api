import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { PlansModule } from './modules/plan/plan.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { AuthModule } from './modules/auth/auth.module';
import { HashModule } from './modules/hash/hash.module';
import { DatabaseModule } from './modules/database/database.module';
import { TypedConfigModule } from './modules/config/typed-config.module';
import { SeedModule } from './modules/database/seeders/seed.module';

@Module({
  imports: [
    TypedConfigModule,
    DatabaseModule,
    UserModule,
    PlansModule,
    SubscriptionModule,
    AuthModule,
    HashModule,
    SeedModule,
  ],
})
export class AppModule {}
