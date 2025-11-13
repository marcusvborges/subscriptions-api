import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { PlansModule } from './modules/plan/plan.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { AuthModule } from './modules/auth/auth.module';
import { HashModule } from './modules/hash/hash.module';
import { DatabaseModule } from './modules/database/database.module';
import { TypedConfigModule } from './modules/config/typed-config.module';

@Module({
  imports: [
    TypedConfigModule,
    DatabaseModule,
    UserModule,
    PlansModule, 
    SubscriptionModule, 
    AuthModule, 
    HashModule
  ],
})
export class AppModule {}
