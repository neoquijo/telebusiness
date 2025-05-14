import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "./models/user.schema";
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>
  ) { }

  async findByLoginOrEmail(login: string): Promise<User | null> {

    const user = await this.userModel.findOne({
      $or: [{
        login: login,
      }, {
        email: login
      },
      {
        id: login
      }
      ]
    })
    return user
  }

  async createUser(user: any) {
    try {
      if (!user.email)
        throw new BadRequestException('El campo email es obligatorio!')
      const { password, ...newUserData } = user
      const hashedPassword = await bcrypt.hash(password, 7)
      const newUser = await this.userModel.create({ password: hashedPassword, ...newUserData })
      await newUser.save()
      return newUser;
    } catch (error) {
      throw error
    }
  }

  async findUserById(id: string) {
    const user = await this.userModel.findOne({ id }).lean()
    if (!user) throw new NotFoundException('Usuario no encontrado')

    const { password, ...userData } = user
    return userData

  }

}