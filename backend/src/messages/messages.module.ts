import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TelegramMessage, telegramMessageSchema } from './models/message.model';
import { MessagesController } from './messages.controller';
import { AuthModule } from 'src/auth/auth.module';
import { FiltersModule } from 'src/filters/filters.module';

@Module({
  controllers: [MessagesController],
  providers: [MessagesService],
  imports: [
    MongooseModule.forFeature([
      { name: TelegramMessage.name, schema: telegramMessageSchema }
    ]),
    AuthModule,
    FiltersModule
  ],
  exports: [MessagesService]
})
export class MessagesModule { }
