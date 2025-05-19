import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { MessagesService } from "./messages.service";
import { AuthGuard } from "src/auth/user.guard";
import { CurrentUser } from "src/auth/user.decorator";
import { User } from "src/users/models/user.schema";
import { queryFilter, ReqFilters } from "src/decorators/ReqFilters";

@UseGuards(AuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService
  ) { }

  @Get('/')
  async getUserMessages(
    @queryFilter() filters: ReqFilters,
    @CurrentUser() user: User
  ) {
    return await this.messagesService.getUserMessages(filters, user);
  }

  @Get('/filtered')
  async getFilteredMessages(
    @queryFilter() filters: ReqFilters,
    @CurrentUser() user: User
  ) {
    return await this.messagesService.getFilteredMessages(filters, user);
  }

  @Get('/by-filter/:filterId')
  async getMessagesByFilter(
    @Param('filterId') filterId: string,
    @queryFilter() filters: ReqFilters,
    @CurrentUser() user: User
  ) {
    return await this.messagesService.getMessagesByFilter(filterId, filters, user);
  }

  @Get('/statistics')
  async getMessagesStatistics(
    @queryFilter() filters: ReqFilters,
    @CurrentUser() user: User
  ) {
    return await this.messagesService.getMessagesStatistics(filters, user);
  }

  @Get('/:id')
  async getMessage(
    @Param('id') id: string,
    @CurrentUser() user: User
  ) {
    return await this.messagesService.getMessageById(id, user);
  }
}