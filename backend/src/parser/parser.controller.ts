import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ParserService } from "./parser.service";
import { AuthGuard, AdminGuard } from "src/auth/user.guard";
import { CurrentUser } from "src/auth/user.decorator";
import { User } from "src/users/models/user.schema";

@Controller('parser')
export class ParserController {
  constructor(
    private readonly parserService: ParserService
  ) { }

  @UseGuards(AdminGuard)
  @Get('/status')
  async getParsingStatus() {
    return await this.parserService.getParsingStatus();
  }

  @UseGuards(AuthGuard)
  @Post('/enable/:accountId')
  async enableParsing(
    @Param('accountId') accountId: string,
    @CurrentUser() user: User
  ) {
    await this.parserService.enableParsingForAccount(accountId);
    return { message: `Parsing enabled for account ${accountId}` };
  }

  @UseGuards(AuthGuard)
  @Post('/disable/:accountId')
  async disableParsing(
    @Param('accountId') accountId: string,
    @CurrentUser() user: User
  ) {
    await this.parserService.disableParsingForAccount(accountId);
    return { message: `Parsing disabled for account ${accountId}` };
  }
}