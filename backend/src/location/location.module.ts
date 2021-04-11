import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationController } from './location.controller';
import { Location } from './location.entity';
import { LocationService } from './location.service';

@Module({
  imports: [ TypeOrmModule.forRoot() ], // TypeOrmModule.forFeature([Location], 'hkadmin'), 
  controllers: [LocationController],
  providers: [LocationService ]
})
export class LocationModule {}
