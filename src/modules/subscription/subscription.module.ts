import { forwardRef, Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { UserModule } from '../user/user.module';
import { PlansModule } from '../plan/plan.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription]),
    UserModule,
    forwardRef(() => PlansModule),
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
