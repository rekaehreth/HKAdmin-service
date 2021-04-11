import { Module } from '@nestjs/common';
import { CoachService } from './coach.service';
import { CoachController } from './coach.controller';

@Module({
  providers: [CoachService],
  controllers: [CoachController]
})
export class CoachModule {}
