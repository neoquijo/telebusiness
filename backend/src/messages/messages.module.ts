import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TelegramMessage, telegramMessageSchema } from './models/message.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TelegramMessage.name, schema: telegramMessageSchema }
    ])
  ],
  providers: [MessagesService],
  exports: [MessagesService]
})
export class MessagesModule { }
