import { Module } from '@nestjs/common';
import { ParserService } from './parser.service';
import { AccountsModule } from 'src/accounts/accounts.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, accountSchema } from 'src/accounts/models/account.schema';
import { MessageFilter, messageFilterSchema } from 'src/filters/models/message-filter.schema';
import { TelegramMessage, telegramMessageSchema } from 'src/messages/models/message.model';
import { FiltersModule } from 'src/filters/filters.module';
import { MessagesModule } from 'src/messages/messages.module';
import { LeadsModule } from 'src/leads/leads.module';
import { ParserController } from './parser.controller';
import { Lead, leadSchema } from 'src/leads/models/lead.schema';
import { AIModule } from 'src/artificial-intelligence/artificial-intelligence.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ParserController],
  providers: [ParserService],
  imports: [
    AuthModule,
    AccountsModule,
    FiltersModule,
    MessagesModule,
    AIModule,
    LeadsModule,
    MongooseModule.forFeature([
      { name: Account.name, schema: accountSchema },
      { name: MessageFilter.name, schema: messageFilterSchema },
      { name: TelegramMessage.name, schema: telegramMessageSchema },
      { name: Lead.name, schema: leadSchema },
    ]),
  ],
  exports: [ParserService]
})
export class ParserModule { }