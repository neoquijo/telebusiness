import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountController } from './accounts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, accountSchema } from './models/account.schema';
import { AuthModule } from 'src/auth/auth.module';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { AccountsStorage } from './accounts.storage';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Account.name, schema: accountSchema }
    ]),

  ],
  exports: [
    AccountsService, AccountsStorage
  ],
  providers: [
    AccountsService,
    {
      provide: TelegramClient,
      useFactory: async () => {
        const client = new TelegramClient(
          new StringSession(''),
          19177732,
          "b100d80721045777438318e47409ecae",
          {}
        );
        await client.connect();
        return client;
      },
    },
    AccountsStorage
  ],
  controllers: [AccountController]
})
export class AccountsModule { }
