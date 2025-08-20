import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PlansModule } from './plan/plan.module';

@Module({
  imports: [UserModule, PlansModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
