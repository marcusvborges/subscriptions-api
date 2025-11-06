import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { PlansModule } from './modules/plan/plan.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { AuthModule } from './modules/auth/auth.module';
import { HashModule } from './modules/hash/hash.module';

@Module({
  imports: [
    UserModule,
    PlansModule, 
    SubscriptionModule, 
    AuthModule, 
    HashModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
