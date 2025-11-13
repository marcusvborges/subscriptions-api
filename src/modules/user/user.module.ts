import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { HashModule } from '../hash/hash.module';
import { Subscription } from '../subscription/entities/subscription.entity';
import { Plan } from '../plan/entities/plan.entity';
import { Auth } from '../auth/entities/auth.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Auth,
      Subscription,
      Plan,
    ]),
    HashModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
