import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { queryFilter, ReqFilters } from "src/decorators/ReqFilters";
import { ChatsService } from "./chats.service";
import { ChatCollectionsService } from "./chatCollections.service";
import { CurrentUser } from "src/auth/user.decorator";
import { User } from "src/users/models/user.schema";
import { AuthGuard } from "src/auth/user.guard";
import { ChatImports } from "./types";

@Controller('/chats')
export class ChatsController {

  constructor(
    private readonly chats: ChatsService,
    private readonly chatCollections: ChatCollectionsService
  ) { }
  @UseGuards(AuthGuard)
  @Get('/my')
  async getChats(@queryFilter() filters: ReqFilters, @CurrentUser() user: User) {

    const chats = await this.chats.getUserChats(filters, user)
    return chats
  }

  @UseGuards(AuthGuard)
  @Get('/')
  async getPublicChats(@queryFilter() filters, @CurrentUser() user: User) {
    return await this.chats.getUserChats(filters, user)
  }

  @Post('/import/:accountId')
  @UseGuards(AuthGuard)
  async importChats(
    @Body() imports: ChatImports,
    @CurrentUser() user: User,
    @Param('accountId') accountId: string
  ) {
    const importedChats = await this.chats.importChats(imports, user, accountId);
    return {
      success: true,
      imported: importedChats.length,
      chats: importedChats
    };
  }
}
