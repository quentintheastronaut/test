import { PageDto, PageOptionsDto } from 'src/dtos';
import { User } from 'src/entities';
import { UserDto } from './dto/request/user.dto';
import { UpdateProfileDto } from './dto/request/updateProfile.dto';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { JwtUser } from '../auth/dto/parsedToken.dto';
import { UserService } from './user.service';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from 'src/decorators';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtGuard)
  @Get('/profile')
  async getProfile(@Req() req: { user: JwtUser }) {
    const { user } = req;
    return this.userService.getProfile(user);
  }

  @UseGuards(JwtGuard)
  @Post('/profile')
  async updateProfile(
    @Req() req: { user: JwtUser },
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const { user } = req;
    return this.userService.updateProfile(user, updateProfileDto);
  }

  @UseGuards(JwtGuard)
  @Get('/bmi')
  @ApiOperation({ summary: "Get user's Body Mass Index" })
  async getDailyCalories(@Req() req: { user: JwtUser }) {
    const { user } = req;
    return this.userService.getBodyMassIndex(user);
  }

  @UseGuards(JwtGuard)
  @Get('/bmr')
  @ApiOperation({ summary: "Get user's Basal Metabolic Rate" })
  async getBasalMetabolicRate(@Req() req: { user: JwtUser }) {
    const { user } = req;
    return this.userService.getBasalMetabolicRate(user);
  }

  @Post()
  @ApiOperation({ summary: 'Create new user' })
  async createUser(@Body() userDto: UserDto): Promise<PageDto<User>> {
    return this.userService.createUser(userDto);
  }

  @Get()
  @ApiPaginatedResponse(User)
  @ApiOperation({ summary: 'Get all of users' })
  async getAllUsers(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<User[]>> {
    return this.userService.getAllUser(pageOptionsDto);
  }

  @Patch('/activate')
  @ApiPaginatedResponse(User)
  @ApiOperation({ summary: 'Activate user' })
  async activateUser(@Param('id') id: number): Promise<PageDto<User>> {
    return this.userService.activateUser(id);
  }

  @Patch('/deactivate')
  @ApiPaginatedResponse(User)
  @ApiOperation({ summary: 'Deactivate user' })
  async deactivateUser(@Param('id') id: number): Promise<PageDto<User>> {
    return this.userService.deactivateUser(id);
  }
}
