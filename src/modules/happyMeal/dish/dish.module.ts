import { DishRepository } from './../../../repositories/dish.repository';
import { DishService } from './dish.service';
import { DishController } from './dish.controller';
import { Module } from '@nestjs/common';
import { IngredientService } from '../ingredient/ingredient.service';
import { MeasurementService } from '../measurement/measurement.service';

@Module({
  controllers: [DishController],
  providers: [
    DishService,
    DishRepository,
    IngredientService,
    MeasurementService,
  ],
  exports: [DishService],
})
export class DishModule {}
