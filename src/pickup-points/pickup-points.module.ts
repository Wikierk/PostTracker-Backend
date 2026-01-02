import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PickupPointsService } from './pickup-points.service';
import { PickupPointsController } from './pickup-points.controller';
import { PickupPoint } from './entities/pickup-point.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PickupPoint])],
  controllers: [PickupPointsController],
  providers: [PickupPointsService],
})
export class PickupPointsModule {}
