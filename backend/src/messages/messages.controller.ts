import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/user.decorator';
import { AuthGuard } from 'src/auth/user.guard';
import { User } from 'src/users/models/user.schema';
import { MessagesService } from './messages.service';
import { InjectModel } from '@nestjs/mongoose';
import { TelegramMessage } from './models/message.model';
import { Model, Types } from 'mongoose';
import { queryFilter, ReqFilters } from 'src/decorators/ReqFilters';

@UseGuards(AuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    @InjectModel(TelegramMessage.name) private readonly messageModel: Model<TelegramMessage>
  ) { }

  @Get('/filter/:filterId')
  async getMessagesByFilter(
    @Param('filterId') filterId: string,
    @Query('processed') processed: string,
    @CurrentUser() user: User,
    @queryFilter() filters: ReqFilters
  ) {
    // Convert string to boolean
    const isProcessed = processed === 'true';

    // Query messages
    const query = {
      user: user._id,
      filtered: new Types.ObjectId(filterId),
      aiProcessed: isProcessed
    };

    return await this.messageModel.find(query)
      .sort({ createdAt: -1 })
      .limit(filters.limit || 20)
      .skip(filters.page ? (filters.page - 1) * (filters.limit || 20) : 0)
      .exec();
  }
}
