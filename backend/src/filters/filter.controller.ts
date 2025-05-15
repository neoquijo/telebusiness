import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards
} from "@nestjs/common";
import { MessageFilterService } from "./message-filter.service";
import { AuthGuard } from "src/auth/user.guard";
import { CurrentUser } from "src/auth/user.decorator";
import { User } from "src/users/models/user.schema";
import { queryFilter, ReqFilters } from "src/decorators/ReqFilters";
import { CreateMessageFilterDto, UpdateMessageFilterDto } from "./models/telegram-message.dto";

@UseGuards(AuthGuard)
@Controller('filters')
export class FiltersController {
  constructor(
    private readonly messageFilterService: MessageFilterService
  ) { }

  @Get('/')
  async getMessageFilters(
    @queryFilter() filters: ReqFilters,
    @CurrentUser() user: User
  ) {
    return await this.messageFilterService.getUserFilters(filters, user);
  }

  @Get('/:id')
  async getMessageFilter(
    @Param('id') id: string,
    @CurrentUser() user: User
  ) {
    return await this.messageFilterService.getFilterById(id, user);
  }

  @Post('/')
  async createMessageFilter(
    @Body() createDto: CreateMessageFilterDto,
    @CurrentUser() user: User
  ) {
    return await this.messageFilterService.createFilter(createDto, user);
  }

  @Put('/:id')
  async updateMessageFilter(
    @Param('id') id: string,
    @Body() updateDto: UpdateMessageFilterDto,
    @CurrentUser() user: User
  ) {
    return await this.messageFilterService.updateFilter(id, updateDto, user);
  }

  @Delete('/:id')
  async deleteMessageFilter(
    @Param('id') id: string,
    @CurrentUser() user: User
  ) {
    return await this.messageFilterService.deleteFilter(id, user);
  }

  @Post('/:id/test')
  async testFilter(
    @Param('id') id: string,
    @Body() testData: { messageText: string },
    @CurrentUser() user: User
  ) {
    return await this.messageFilterService.testFilter(id, testData.messageText, user);
  }
}