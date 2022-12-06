import { IngredientToDish } from './IngredientToDish';
import { IsString } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DishToMenu } from './DishToMenu';

@Entity()
export class Dish {
  @PrimaryGeneratedColumn({
    name: 'id',
  })
  @IsString()
  id: string;

  @IsString()
  @Column()
  name: string;

  @IsString()
  @Column({
    default: '',
  })
  description: string;

  @IsString()
  @Column({
    nullable: true,
  })
  slug: string;

  @Column({
    default: 0,
    nullable: true,
  })
  carbohydrates: number;

  @Column({
    default: 0,
    nullable: true,
  })
  fat: number;

  @Column({
    default: 0,
    nullable: true,
  })
  protein: number;

  @Column({
    default: 0,
    nullable: true,
  })
  calories: number;

  @Column({
    default: '',
  })
  imageUrl: string;

  @Column({
    default: '',
  })
  recipe: string;

  @Column({
    default: 30,
  })
  cookingTime: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => DishToMenu, (dishToMenu) => dishToMenu.dish, {
    onDelete: 'SET NULL',
  })
  public dishToMenus!: DishToMenu[];

  @OneToMany(
    () => IngredientToDish,
    (ingredientToDish) => ingredientToDish.dish,
    {
      onDelete: 'SET NULL',
    },
  )
  public ingredientsToDish!: IngredientToDish[];
}
