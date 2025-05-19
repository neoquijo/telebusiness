import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, UseGuards } from "@nestjs/common";
import { AccountsService } from "./accounts.service";
import { AuthGuard } from "src/auth/user.guard";
import { CurrentUser } from "src/auth/user.decorator";
import { User } from "src/users/models/user.schema";
import { TelegramClientFactory } from "src/telegram/telegram";
import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { ApiCredentials } from "telegram/client/auth";
import { queryFilter, ReqFilters } from "src/decorators/ReqFilters";

@UseGuards(AuthGuard)
@Controller('/accounts')
export class AccountController {

  ApiConfig: ApiCredentials
  constructor(
    private readonly accountsService: AccountsService,
    private readonly client: TelegramClient
  ) {
    this.client = new TelegramClient(new StringSession(''), 19177732, "b100d80721045777438318e47409ecae", {})
    this.client.connect().then(() => console.log('client connected')).catch(e => {
      console.log('ERRRRRRRRRRRRRRROOORRRR!!! accounts.controller.ts')
    })
    this.ApiConfig =
    {
      apiHash: "b100d80721045777438318e47409ecae",
      apiId: 19177732,

    }

  }

  @Get('/chats/:id')
  async getAccountChats(@Param('id') id: string, @queryFilter() filters: ReqFilters) {
    filters.periodOption
    return await this.accountsService.getChats(id)
  }

  @Post('/create')
  async createAccount(@Body() data: { accountName: string, session: string }, @CurrentUser() user: User) {
    return this.accountsService.createAccount(data.accountName, data.session, user)
  }

  @Post('/sendCode')
  async sendCode(@Body() data: { phone: string }) {
    const exist = await this.accountsService.findByPhoneNumber(data.phone)
    if (exist)
      throw new HttpException('ACCOUNT_ALREADY_EXIST', HttpStatus.CONFLICT)
    else {
      const response = await this.accountsService.sendCode(data.phone)
      return response
    }
  }

  @Post('/delete')
  async deleteAccount(@Body('id') id: string) {
    return await this.accountsService.deleteAccount(id)
  }

  @Post('/verifyCode')
  async verifyCode(@Body() data: { code: string, phone: string, hash: string, password: string }) {
    const result = await this.accountsService.createSession(data.hash, data.code, data.phone, data.password)
    return result
  }

  @Post('/use2fa')
  async use2fa(@Body() data) {
    // await this.accountsService.createSession()
  }


  @Get('/:id')
  async getAccount(@Param('id') id: string) {
    return await this.accountsService.getAccount(id)
  }

  @UseGuards(AuthGuard)
  @Get('/')
  async getUserAccounts(@CurrentUser() user) {
    return await this.accountsService.getAccounts(user)
  }

  // @Get('/dialogs')
  // async getAccount(@CurrentUser() user: User) {
  //   const account = await TelegramClientFactory.getClient(String("8U7-VLCQ"))
  //   const dialogs = await account.getDialogs()
  //   return dialogs.map(el => {

  //     return {
  //       title: el.title
  //     }
  //   })

  // }

}