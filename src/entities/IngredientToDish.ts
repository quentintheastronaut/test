import { Ingredient } from 'src/entities/Ingredient';
import { Dish } from 'src/entities/Dish';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class IngredientToDish {
  @PrimaryGeneratedColumn()
  public ingredientToDishId!: string;

  @Column()
  public ingredientId!: string;

  @Column()
  public dishId!: string;

  @Column({
    default: 1,
  })
  public quantity!: number;

  @Column({
    default: 'GRAMME',
  })
  public measurementType!: string;

  @Column({
    default: 0,
  })
  public weight!: number;

  @ManyToOne(() => Dish, (dish) => dish.ingredientsToDish)
  public dish!: Dish;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.ingredientsToDish)
  public ingredient!: Ingredient;
}
