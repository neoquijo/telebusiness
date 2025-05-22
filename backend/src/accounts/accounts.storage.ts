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
    } else {
      // Отмечаем аккаунт как ошибочный, если клиент не удалось создать
      await this.markAccountAsError(accountId);
      console.log(`Failed to add client for account ${accountId}, marked as error`);
    }
  }

  public async removeClient(accountId: string) {
    const client = this.clients.get(accountId);
    if (client) {
      try {
        await client.disconnect();
        console.log(`Client ${accountId} disconnected successfully`);
      } catch (error) {
        console.error(`Error disconnecting client ${accountId}:`, error.message);
      }
      this.clients.delete(accountId);
      console.log(`Client ${accountId} removed from storage`);
    }
  }

  private async createClient(sessionData: string): Promise<BaseTelegramClient | null> {
    console.log('Creating client with session', sessionData.substring(0, 10) + '...');

    const client = new BaseTelegramClient({
      session: new StringSession(sessionData),
      apiId: Number(process.env.API_ID),
      apiHash: process.env.API_HASH,
      connectionRetries: 3
    });

    try {
      await client.connect();
      // Проверяем сессию, пытаясь получить информацию о пользователе
      await client.getMe();
      console.log('Client created and session verified successfully');
      return client;
    } catch (error) {
      console.error('Failed to create client. Session may be invalid:', error.message);
      try {
        await client.disconnect();
      } catch (disconnectError) {
        console.error('Error disconnecting client:', disconnectError.message);
      }
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
        console.log(`Account ${accountId} verified and client added`);
        return true;
      }
      // Если клиент не создан, отмечаем аккаунт как error
      await this.markAccountAsError(accountId);
      console.log(`Account ${accountId} verification failed, marked as error`);
      return false;
    } catch (error) {
      console.error(`Error verifying account ${accountId}:`, error.message);
      await this.markAccountAsError(accountId);
      console.log(`Account ${accountId} verification error, marked as error`);
      return false;
    }
  }

  public async markAccountAsError(accountId: string) {
    try {
      const result = await this.accountModel.updateOne(
        { id: accountId },
        { status: 'error' }
      ).exec();
      console.log(`Account ${accountId} marked as error. Updated ${result.modifiedCount} documents`);
    } catch (dbError) {
      console.error(`Database error updating account ${accountId} status:`, dbError.message);
    }
  }

  private startStatusChecks() {
    this.intervalId = setInterval(async () => {
      console.log(`Starting periodic status check for ${this.clients.size} clients`);

      for (const [accountId, client] of this.clients) {
        console.log(`Checking account ${accountId}`);

        try {
          // Получаем свежие данные об аккаунте из БД
          const account = await this.accountModel.findOne({ id: accountId });

          if (!account) {
            console.log(`Account ${accountId} not found in database, removing client`);
            await this.removeClient(accountId);
            continue;
          }

          if (account.status !== 'alive') {
            console.log(`Account ${accountId} status is ${account.status}, removing client`);
            await this.removeClient(accountId);
            continue;
          }

          // Проверяем сессию
          try {
            const me = await client.getMe();
            if (me && me.id) {
              console.log(`Account ${accountId} (user ID: ${me.id}) status verified as alive`);
            } else {
              console.warn(`Account ${accountId} getMe() returned unexpected result:`, me);
              await this.markAccountAsError(accountId);
              await this.removeClient(accountId);
            }
          } catch (sessionError) {
            // Ошибка при проверке сессии - сессия недействительна
            console.error(`Session error for account ${accountId}:`, sessionError.message);
            await this.markAccountAsError(accountId);
            await this.removeClient(accountId);
          }
        } catch (error) {
          // Общая ошибка при проверке аккаунта
          console.error(`General error checking account ${accountId}:`, error.message);
          await this.markAccountAsError(accountId);
          await this.removeClient(accountId);
        }
      }
    }, 5000); // Проверка каждые 90 секунд
  }

  private async handleInvalidSession(accountId: string) {
    try {
      const result = await this.accountModel.updateOne(
        { id: accountId },
        { status: 'error' } // Изменено с 'expired' на 'error'
      ).exec();
      console.log(`Account ${accountId} marked as error due to invalid session. Updated ${result.modifiedCount} documents`);
      await this.removeClient(accountId);
    } catch (dbError) {
      console.error(`Database error updating account ${accountId} status:`, dbError.message);
    }
  }

  private stopStatusChecks() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      console.log('Status checks stopped');
    }
  }

  private async disconnectAllClients() {
    console.log(`Disconnecting all clients (${this.clients.size} total)`);
    const disconnectPromises = [];

    this.clients.forEach((client, accountId) => {
      disconnectPromises.push(
        client.disconnect()
          .then(() => console.log(`Client ${accountId} disconnected successfully`))
          .catch(error => console.error(`Error disconnecting client ${accountId}:`, error.message))
      );
    });

    await Promise.allSettled(disconnectPromises);
    this.clients.clear();
    console.log('All clients disconnected and cleared');
  }
}