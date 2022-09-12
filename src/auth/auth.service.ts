import * as dotenv from 'dotenv';
import { JwtService } from '@nestjs/jwt';
import { User } from './../enitity/User';
import { AppDataSource } from './../data-source';
import { AuthDto } from './dto/auth.dto';
import { ForbiddenException, Injectable } from '@nestjs/common';
import * as argon from 'argon2';

dotenv.config({
  path: `.env`,
});
@Injectable({})
export class AuthService {
  constructor(private jwt: JwtService) {}

  async signUp(authDto: AuthDto) {
    // generate the password argon.hash
    const { email, password } = authDto;
    const hash = await argon.hash(password);

    try {
      await AppDataSource.createQueryBuilder()
        .insert()
        .into(User)
        .values([
          {
            email,
            password: hash,
          },
        ])
        .execute();

      // return saved user
      return {
        message: 'Successfully',
      };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY')
        throw new ForbiddenException('Credentials taken');
    }
    // save the new user into db
  }

  async login(authDto: AuthDto) {
    const { email, password } = authDto;

    const user = await AppDataSource.getRepository(User).findOne({
      where: {
        email,
      },
    });

    if (!user) {
      throw new ForbiddenException('Credential incorrect');
    }

    const pwMatches = await argon.verify(user.password, password);
    if (!pwMatches) {
      throw new ForbiddenException('Credential incorrect');
    }

    delete user.password;

    return this.signToken(parseInt(user.id, 10), email);
  }

  async signToken(id: number, email: string): Promise<{ accessToken: string }> {
    const payload = {
      sub: id,
      email,
    };

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: process.env.JWT_SECRET,
    });

    return {
      accessToken: token,
    };
  }
}
