import { MeasurementController } from './measurement.controller';
import { MeasurementService } from './measurement.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [MeasurementController],
  providers: [MeasurementService],
})
export class MeasurementModule {}
