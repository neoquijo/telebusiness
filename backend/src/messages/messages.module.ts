import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TelegramMessage, telegramMessageSchema } from './models/message.model';
import { MessagesController } from './messages.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: TelegramMessage.name, schema: telegramMessageSchema }
    ])
  ],
  providers: [MessagesService],
  exports: [MessagesService],
  controllers: [MessagesController]
})
export class MessagesModule { }
