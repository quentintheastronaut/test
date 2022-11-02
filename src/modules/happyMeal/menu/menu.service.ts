import { JwtUser } from './../auth/dto/parsedToken.dto';
import { DishToMenu } from './../../../entities/DishToMenu';
import { MenuDto } from './dto/request/menu.dto';
import { AppDataSource } from './../../../data-source';
import { PageOptionsDto } from './../../../dtos/pageOption.dto';
import {
  Injectable,
  InternalServerErrorException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PageDto } from 'src/dtos/page.dto';
import { PageMetaDto } from 'src/dtos/pageMeta.dto';
import { Menu } from 'src/entities/Menu';
import { AddDishDto } from './dto/request/addDish.dto';
import { Equal } from 'typeorm';
import { User } from 'src/entities';
import { RemoveDishDto } from './dto/request/removeDish.dto';
import { UpdateDishToMenuDto } from './dto/request/updateDishToMenu.dto';

@Injectable({})
export class MenuService {
  public async updateMenu(
    id: number,
    menuDto: MenuDto,
  ): Promise<PageDto<Menu>> {
    const menu = await AppDataSource.getRepository(Menu).findOne({
      where: {
        id: id.toString(),
      },
    });

    if (!menu) {
      throw new NotFoundException('Not found');
    }
    try {
      await AppDataSource.createQueryBuilder()
        .update(Menu)
        .set(menuDto)
        .where('id = :id', { id })
        .execute();
      return new PageDto('OK', HttpStatus.OK);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  public async createMenu(menuDto: MenuDto): Promise<PageDto<Menu>> {
    try {
      await AppDataSource.createQueryBuilder()
        .insert()
        .into(Menu)
        .values([menuDto])
        .execute();
      return new PageDto('OK', HttpStatus.OK);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  public async deleteMenu(id: number): Promise<PageDto<Menu>> {
    const menu = await AppDataSource.getRepository(Menu).findOne({
      where: {
        id: id.toString(),
      },
    });

    if (!menu) {
      throw new NotFoundException('Not found');
    }
    try {
      await AppDataSource.createQueryBuilder()
        .delete()
        .from(Menu)
        .where('id = :id', { id })
        .execute();
      return new PageDto('OK', HttpStatus.OK);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  public async getAllMenues(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Menu[]>> {
    const queryBuilder = AppDataSource.createQueryBuilder();

    queryBuilder
      .select('menu')
      .from(Menu, 'menu')
      .orderBy('menu.createdAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.limit);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ total: itemCount, pageOptionsDto });

    return new PageDto('OK', HttpStatus.OK, entities, pageMetaDto);
  }

  public async addDish(
    addDishDto: AddDishDto,
    jwtUser: JwtUser,
  ): Promise<PageDto<Menu>> {
    try {
      const { email } = jwtUser;
      const menu = await AppDataSource.getRepository(Menu).findOne({
        relations: {
          user: true,
        },
        where: {
          date: addDishDto.date,
          user: {
            email: email,
          },
        },
      });

      const user = await AppDataSource.getRepository(User).findOne({
        where: {
          email,
        },
      });

      if (!menu) {
        const newMenuId = await AppDataSource.createQueryBuilder()
          .insert()
          .into(Menu)
          .values({
            date: addDishDto.date,
            user: user,
          })
          .execute();

        await AppDataSource.createQueryBuilder()
          .insert()
          .into(DishToMenu)
          .values({
            menuId: newMenuId.identifiers[0].id,
            ...addDishDto,
          })
          .execute();
      } else {
        await AppDataSource.createQueryBuilder()
          .insert()
          .into(DishToMenu)
          .values({
            menuId: menu.id,
            ...addDishDto,
          })
          .execute();
      }

      return new PageDto('OK', HttpStatus.OK);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async removeDish(
    removeDishDto: RemoveDishDto,
    jwtUser: JwtUser,
  ): Promise<PageDto<Menu>> {
    const { email } = jwtUser;
    const menu = await AppDataSource.getRepository(Menu).findOne({
      relations: {
        user: true,
      },
      where: {
        date: removeDishDto.date,
        user: {
          email: email,
        },
      },
    });

    if (!menu) {
      throw new BadRequestException('This plan is not existed !');
    }

    try {
      await AppDataSource.createQueryBuilder()
        .delete()
        .from(DishToMenu)
        .where('dishId = :dishId and menuId = :menuId and meal = :meal', {
          ...removeDishDto,
          menuId: menu.id,
        })
        .execute();

      return new PageDto('OK', HttpStatus.OK);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getMenuByDate(
    date: string,
    jwtUser: JwtUser,
  ): Promise<PageDto<DishToMenu[]>> {
    const { email } = jwtUser;
    const menu = await AppDataSource.getRepository(Menu).findOne({
      relations: {
        user: true,
      },
      where: {
        date,
        user: {
          email: email,
        },
      },
    });

    if (!menu) {
      throw new BadRequestException('This plan is not existed !');
    }

    try {
      const result = await AppDataSource.createQueryBuilder(
        DishToMenu,
        'dish_to_menu',
      )
        .leftJoinAndSelect('dish_to_menu.dish', 'dish')
        .where('menuId = :menuId', { menuId: menu.id })
        .getMany();

      return new PageDto('OK', HttpStatus.OK, result);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  public async updateMenuDetail(
    updateDishDto: UpdateDishToMenuDto,
  ): Promise<PageDto<Menu>> {
    const dish = await AppDataSource.getRepository(DishToMenu).findOne({
      where: {
        dishToMenuId: updateDishDto.dishToMenuId,
      },
    });

    if (!dish) {
      throw new NotFoundException('This dish is not existed in any menu !');
    }

    try {
      await AppDataSource.createQueryBuilder()
        .update(DishToMenu)
        .set(updateDishDto)
        .where('dishToMenuId = :dishToMenuId', {
          dishToMenuId: updateDishDto.dishToMenuId,
        })
        .execute();
      return new PageDto('OK', HttpStatus.OK);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
