import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PlansModule } from './plan/plan.module';
import { SubscriptionModule } from './subscription/subscription.module';

@Module({
  imports: [UserModule, PlansModule, SubscriptionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
