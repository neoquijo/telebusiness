import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/models/user.schema';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly users: UsersService,

  ) { }

  private async generateToken(payload: string): Promise<string> {
    return this.jwtService.sign(payload)
  }


  async login(login: string, pass: string): Promise<{ access_token: string }> {
    try {
      const user = await this.users.findByLoginOrEmail(login)
      console.log(user)
      if (!user) { throw new NotFoundException('Usuario no encontrado!') }
      const valid = bcrypt.compareSync(pass, user.password)
      if (valid) {
        const access_token = await this.generateToken(user.id);
        return { access_token, };
      }
      else throw new UnauthorizedException('wrong password')
    } catch (error) {
      console.log(error)
      throw new ForbiddenException(error.message)
    }
  }


  async checkAuth(token: string): Promise<Omit<User, 'password'>> {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.users.findUserById(decoded) as unknown as User
      return user
    } catch (error) {
      throw new UnauthorizedException('Token not valid')
    }
  }

  async refreshToken(oldToken: string): Promise<{ access_token: string }> {
    return { access_token: '' }
  }

  async createTestAdmin() {
    return await this.users.createUser({

      login: 'admin',
      password: 'pass',
      email: 'alexei@mikhaltsov.pro'
    })
  }
}
