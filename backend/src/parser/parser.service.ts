import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Account } from "src/accounts/models/account.schema";
import { MessageFilter } from "src/filters/models/message-filter.schema";

import { AccountsStorage } from "src/accounts/accounts.storage";
import { NewMessageEvent } from "telegram/events";
import { TelegramMessage } from "src/messages/models/message.model";
import { BaseTelegramClient } from "src/Base/BaseClient";
import { StringSession } from "telegram/sessions";


@Injectable()
export class ParserService implements OnModuleInit, OnModuleDestroy {
  private handlers: Map<string, (event: NewMessageEvent) => void> = new Map();

  constructor(
    @InjectModel(Account.name) private readonly accountModel: Model<Account>,
    @InjectModel(MessageFilter.name) private readonly filterModel: Model<MessageFilter>,
    @InjectModel(TelegramMessage.name) private readonly messageModel: Model<TelegramMessage>,
    private readonly accountsStorage: AccountsStorage,
  ) { }

  async onModuleInit() {
    const accounts = await this.accountModel.find({ parsingEnabled: true });
    for (const account of accounts) {
      await this.startParserForAccount(account);
    }
    this.setupChangeStream();
  }

  async onModuleDestroy() {
    for (const [accountId, handler] of this.handlers) {
      const client = this.accountsStorage.getClient(accountId);
      if (client) {
        client.removeMessageHandler(handler);
      }
    }
    this.handlers.clear();
  }

  private async startParserForAccount(account: Account) {
    let client = this.accountsStorage.getClient(account.id);
    if (!client) {
      client = new BaseTelegramClient({
        session: new StringSession(account.sessionData),
        apiId: Number(process.env.API_ID),
        apiHash: process.env.API_HASH,
        connectionRetries: 5,
      });
      this.accountsStorage.addClient(account.id, account.sessionData);
    }
    if (client.status !== "active") {
      await client.initialize();
    }
    const handler = this.createMessageHandler(account);
    client.addMessageHandler(handler);
    this.handlers.set(account.id, handler);
  }

  private async stopParserForAccount(account: Account) {
    const client = this.accountsStorage.getClient(account.id);
    if (client) {
      const handler = this.handlers.get(account.id);
      if (handler) {
        client.removeMessageHandler(handler);
        this.handlers.delete(account.id);
      }
    }
  }

  private createMessageHandler(account: Account) {
    return async (event: NewMessageEvent) => {
      const message = event.message;
      const sender = await message.getSender();
      const messageText = message.text || '';
      const messageMedia = message.media ? [message.media] : [];

      const telegramMessage = new this.messageModel({
        sender: sender ? sender.id : null,
        accountId: account.accountId,
        accountString: account.id,
        user: account.user,
        messageMedia,
        messageText,
        filtered: [],
        filterNames: [],
      });

      const filters = await this.filterModel.find({ user: account.user });

      for (const filter of filters) {
        if (this.filterMatches(messageText, filter)) {
          telegramMessage.filtered.push(filter._id);
          telegramMessage.filterNames.push(filter.name);
          console.log(`Filter matched: ${filter.name}, callbackTopic: ${filter.callbackTopic}, message: ${messageText}`);
        }
      }

      await telegramMessage.save();
    };
  }

  private filterMatches(messageText: string, filter: MessageFilter): boolean {
    if (filter.includesText && filter.includesText.length > 0) {
      for (const text of filter.includesText) {
        if (!messageText.includes(text)) {
          return false;
        }
      }
    }
    if (filter.excludesText && filter.excludesText.length > 0) {
      for (const text of filter.excludesText) {
        if (messageText.includes(text)) {
          return false;
        }
      }
    }
    if (filter.regexp) {
      try {
        const regex = new RegExp(filter.regexp);
        if (!regex.test(messageText)) {
          return false;
        }
      } catch (error) {
        console.error(`Invalid regexp in filter ${filter.name}: ${filter.regexp}`);
        return false;
      }
    }
    return true;
  }

  private setupChangeStream() {
    const changeStream = this.accountModel.watch();
    changeStream.on("change", async (change) => {
      if (change.operationType === "update") {
        const accountId = change.documentKey._id;
        const account = await this.accountModel.findById(accountId);
        if (account) {
          if (account.parsingEnabled) {
            await this.startParserForAccount(account);
          } else {
            await this.stopParserForAccount(account);
          }
        }
      }
    });
  }
}