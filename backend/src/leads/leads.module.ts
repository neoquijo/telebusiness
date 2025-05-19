import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Lead, leadSchema } from './models/lead.schema';
import { LeadService } from './lead.service';
import { LeadController } from './lead.controller';
import { Account, accountSchema } from 'src/accounts/models/account.schema';
import { TelegramMessage, telegramMessageSchema } from 'src/messages/models/message.model';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Lead.name, schema: leadSchema },
      { name: TelegramMessage.name, schema: telegramMessageSchema },
      { name: Account.name, schema: accountSchema }
    ])
  ],
  controllers: [LeadController],
  providers: [LeadService],
  exports: [LeadService]
})
export class LeadsModule { }