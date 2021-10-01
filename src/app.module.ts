import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Location } from './location/location.entity';
import { LocationModule } from './location/location.module';
import { TrainingModule } from './training/training.module';
import { UserModule } from './user/user.module';
import { CoachModule } from './coach/coach.module';
import { GroupModule } from './group/group.module';
import { FinanceModule } from './finance/finance.module';

@Module({
  imports: [ TypeOrmModule.forRoot(), LocationModule, TrainingModule, UserModule, CoachModule, GroupModule, FinanceModule ],
  controllers: [ AppController ],
  providers: [ AppService ],
})
export class AppModule {}
