import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { Model } from 'mongoose';
import { Account } from './models/account.schema';
import { InjectModel } from '@nestjs/mongoose';
import { BaseTelegramClient } from 'src/Base/BaseClient';

@Injectable()
export class AccountsStorage implements OnModuleInit, OnModuleDestroy {
  private clients = new Map<string, BaseTelegramClient>();
  private intervalId: NodeJS.Timeout;

  constructor(
    @InjectModel(Account.name) private readonly accountModel: Model<Account>,
  ) { }

  async onModuleInit() {
    await this.initializeClients();
    this.startStatusChecks();
  }

  onModuleDestroy() {
    this.stopStatusChecks();
    this.disconnectAllClients();
  }

  private async initializeClients() {
    console.log('initializing clients')
    const accounts = await this.accountModel.find({ status: 'alive' }).exec();
    console.log(`Got ${accounts.length} accounts`)
    for (const account of accounts) {
      await this.addClient(account.id, account.sessionData);
    }

  }

  public getClient(accountId: string): BaseTelegramClient | null {
    return this.clients.get(accountId) || null;
  }

  public async addClient(accountId: string, sessionData: string) {
    if (this.clients.has(accountId)) {
      console.log(`Client ${accountId} already exists`);
      return;
    }

    const client = await this.createClient(sessionData);
    if (client) {
      this.clients.set(accountId, client);
      console.log(`Successfully added client for account ${accountId}`);
    }
  }

  public async removeClient(accountId: string) {
    const client = this.clients.get(accountId);
    if (client) {
      await client.disconnect();
      this.clients.delete(accountId);
    }
  }


  private async createClient(sessionData: string): Promise<BaseTelegramClient | null> {
    console.log(sessionData)
    const client = new BaseTelegramClient({
      session: new StringSession(sessionData),
      apiId: Number(process.env.API_ID),
      apiHash: process.env.API_HASH,
      connectionRetries: 3
    }


    );

    try {
      await client.connect();
      await client.getMe();
      return client;
    } catch (error) {
      console.error('Failed to create client:', error);
      await client.disconnect();
      return null;
    }
  }


  public async verifyAndAddClient(accountId: string, sessionData: string) {
    try {
      const client = await this.createClient(sessionData);
      if (client) {
        await this.accountModel.updateOne(
          { id: accountId },
          { status: 'alive' }
        );
        this.clients.set(accountId, client);
        return true;
      }
      return false;
    } catch (error) {
      await this.markAccountAsError(accountId);
      return false;
    }
  }

  private async markAccountAsError(accountId: string) {
    await this.accountModel.updateOne(
      { id: accountId },
      { status: 'error' }
    ).exec();
    console.log(`Account login error: ${accountId}`)
  }

  private startStatusChecks() {
    this.intervalId = setInterval(async () => {
      // console.log(this.clients)
      for (const [accountId, client] of this.clients) {
        try {
          const account = await this.accountModel.findOne({ id: accountId });

          if (!account || account.status !== 'alive') {
            await this.removeClient(accountId);
            continue;
          }
          console.log('Checking account ' + accountId)
          const me = await client.getMe();
          if (me.id) {
            console.log(me.id + ' status alive')
          }
        } catch (error) {
          await this.handleInvalidSession(accountId);
        }
      }
    }, 90000);
  }

  private async handleInvalidSession(accountId: string) {
    await this.accountModel.updateOne(
      { id: accountId },
      { status: 'expired' }
    ).exec();
    await this.removeClient(accountId);
  }

  private stopStatusChecks() {
    clearInterval(this.intervalId);
  }

  private disconnectAllClients() {
    this.clients.forEach(client => client.disconnect());
    this.clients.clear();
  }
}