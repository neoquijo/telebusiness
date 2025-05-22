import { Body, Controller, Get, Headers, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";


@Controller('/auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
  ) { }

  @Post('/login')
  login(@Body() body: { username: string, password: string }) {
    return this.auth.login(body.username, body.password)
  }

  @Post('/me')
  getMe(@Headers() headers) {
    console.log(headers)
    return this.auth.checkAuth(headers.authorization)
  }

  @Get('/create')
  async createUser() {
    return await this.auth.createTestAdmin()
  }


}