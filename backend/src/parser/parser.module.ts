import { Module } from '@nestjs/common';
import { ParserService } from './parser.service';
import { AccountsModule } from 'src/accounts/accounts.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, accountSchema } from 'src/accounts/models/account.schema';
import { MessageFilter, messageFilterSchema } from 'src/filters/models/message-filter.schema';
import { TelegramMessage, telegramMessageSchema } from 'src/messages/models/message.model';

@Module({
  providers: [ParserService],
  imports: [
    AccountsModule,
    MongooseModule.forFeature([
      { name: Account.name, schema: accountSchema },
      { name: MessageFilter.name, schema: messageFilterSchema },
      { name: TelegramMessage.name, schema: telegramMessageSchema },
    ]),
  ],
})
export class ParserModule { }