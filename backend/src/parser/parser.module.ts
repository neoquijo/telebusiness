import { Module } from '@nestjs/common';
import { ParserService } from './parser.service';
import { ParserController } from './parser.controller';
import { AccountsModule } from 'src/accounts/accounts.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, accountSchema } from 'src/accounts/models/account.schema';
import { MessageFilter, messageFilterSchema } from 'src/filters/models/message-filter.schema';
import { TelegramMessage, telegramMessageSchema } from 'src/messages/models/message.model';
import { FiltersModule } from 'src/filters/filters.module';
import { MessagesModule } from 'src/messages/messages.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    AccountsModule,
    FiltersModule,
    MessagesModule,
    MongooseModule.forFeature([
      { name: Account.name, schema: accountSchema },
      { name: MessageFilter.name, schema: messageFilterSchema },
      { name: TelegramMessage.name, schema: telegramMessageSchema },
    ]),
  ],
  providers: [ParserService],
  controllers: [ParserController],
  exports: [ParserService]
})
export class ParserModule { }