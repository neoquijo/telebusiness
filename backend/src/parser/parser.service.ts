import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Account } from "src/accounts/models/account.schema";
import { MessageFilter } from "src/filters/models/message-filter.schema";
import { MessageFilterService } from "src/filters/message-filter.service";
import { AccountsStorage } from "src/accounts/accounts.storage";
import { NewMessageEvent } from "telegram/events";
import { TelegramMessage } from "src/messages/models/message.model";
import { BaseTelegramClient } from "src/Base/BaseClient";
import { StringSession } from "telegram/sessions";
import { MessagesService } from "src/messages/messages.service";
import { Api } from "telegram";

@Injectable()
export class ParserService implements OnModuleInit, OnModuleDestroy {
  private handlers: Map<string, (event: NewMessageEvent) => void> = new Map();

  constructor(
    @InjectModel(Account.name) private readonly accountModel: Model<Account>,
    @InjectModel(MessageFilter.name) private readonly filterModel: Model<MessageFilter>,
    @InjectModel(TelegramMessage.name) private readonly messageModel: Model<TelegramMessage>,
    private readonly accountsStorage: AccountsStorage,
    private readonly messageFilterService: MessageFilterService,
    private readonly messagesService: MessagesService,
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
    try {
      let client = this.accountsStorage.getClient(account.id);

      if (!client) {
        client = new BaseTelegramClient({
          session: new StringSession(account.sessionData),
          apiId: Number(process.env.API_ID),
          apiHash: process.env.API_HASH,
          connectionRetries: 5,
        });

        await this.accountsStorage.addClient(account.id, account.sessionData);
        client = this.accountsStorage.getClient(account.id);
      }

      if (!client) {
        console.error(`Failed to get client for account ${account.id}`);
        return;
      }

      if (client.status !== "active") {
        await client.initialize();
      }

      const handler = this.createMessageHandler(account);
      client.addMessageHandler(handler);
      this.handlers.set(account.id, handler);

      console.log(`Parser started for account ${account.id}`);
    } catch (error) {
      console.error(`Failed to start parser for account ${account.id}:`, error);

      // Помечаем аккаунт как ошибочный
      await this.accountModel.updateOne(
        { id: account.id },
        { status: 'error' }
      );
    }
  }

  private async stopParserForAccount(account: Account) {
    const client = this.accountsStorage.getClient(account.id);
    if (client) {
      const handler = this.handlers.get(account.id);
      if (handler) {
        client.removeMessageHandler(handler);
        this.handlers.delete(account.id);
        console.log(`Parser stopped for account ${account.id}`);
      }
    }
  }

  private createMessageHandler(account: Account) {
    return async (event: NewMessageEvent) => {
      try {
        const message = event.message;
        const messageText = message.text || '';

        // Получаем информацию об отправителе
        let sender = null;
        let sourceType: 'Chat' | 'Channel' | 'Private' | 'Group' = 'Private';

        try {
          sender = await message.getSender();
          const chat = await message.getChat();

          if (chat) {
            // Используем правильную логику определения типа
            if (chat instanceof Api.Channel) {
              sourceType = chat.megagroup ? 'Group' : 'Channel';
            } else if (chat instanceof Api.Chat) {
              sourceType = 'Group';
            } else if (chat instanceof Api.User) {
              sourceType = 'Private';
            } else {
              // Fallback на className
              // switch (chat.className) {
              //   case 'Channel':
              //     const channel = chat as Api.Channel;
              //     sourceType = channel.megagroup ? 'Group' : 'Channel';
              //     break;
              //   case 'Chat':
              //     sourceType = 'Group';
              //     break;
              //   case 'User':
              //     sourceType = 'Private';
              //     break;
              //   default:
              //     sourceType = 'Private';
              // }
            }
          }
        } catch (error) {
          console.error('Error getting message details:', error);
        }

        // Создаем объект сообщения
        const telegramMessage: Partial<TelegramMessage> = {
          sender: sender ? sender.id : null,
          sourceType,
          accountId: account.accountId,
          accountString: account.id,
          user: account.user,
          messageMedia: message.media ? [message.media] : [],
          messageText,
          filtered: [],
          filterNames: [],
          generatedTags: [],
          lang: null, // Можно добавить определение языка
        };

        // Получаем фильтры пользователя
        const filters = await this.messageFilterService.getUserFiltersForAccount(account.user._id);
        console.log('filters:')
        console.log(filters)
        // Проверяем сообщение против каждого фильтра
        for (const filter of filters) {
          if (this.messageFilterService.checkFilterMatches(messageText, filter)) {
            telegramMessage.filtered.push(filter._id);
            telegramMessage.filterNames.push(filter.name);

            console.log(`Message filtered by "${filter.name}": ${messageText.substring(0, 100)}...`);

            // Здесь можно добавить логику для отправки уведомлений
            // или выполнения действий по callbackTopic
            if (filter.callbackTopic) {
              await this.handleFilterCallback(filter.callbackTopic, telegramMessage, filter);
            }
          }
        }

        // Сохраняем сообщение
        await this.messagesService.createMessage(telegramMessage);

      } catch (error) {
        console.error(`Error processing message from account ${account.id}:`, error);
      }
    };
  }

  private async handleFilterCallback(callbackTopic: string, message: any, filter: MessageFilter) {
    try {
      // Здесь можно реализовать различные типы callback'ов
      // Например: отправка HTTP запроса, запись в файл, отправка email и т.д.
      console.log(`Executing callback for topic "${callbackTopic}"`);
      console.log(`Filter: ${filter.name}, Message: ${message.messageText}`);

      // Пример реализации различных типов callback'ов:
      switch (callbackTopic) {
        case 'webhook':
          // await this.sendWebhook(message, filter);
          break;
        case 'email':
          // await this.sendEmail(message, filter);
          break;
        case 'log':
          console.log(`[FILTER LOG] ${filter.name}: ${message.messageText}`);
          break;
        default:
          console.log(`Unknown callback topic: ${callbackTopic}`);
      }
    } catch (error) {
      console.error(`Error handling callback for topic ${callbackTopic}:`, error);
    }
  }

  private setupChangeStream() {
    try {
      const changeStream = this.accountModel.watch();

      changeStream.on("change", async (change) => {
        try {
          if (change.operationType === "update") {
            const accountId = change.documentKey._id;
            const account = await this.accountModel.findById(accountId);

            if (account) {
              const wasParsingEnabled = this.handlers.has(account.id);

              if (account.parsingEnabled && !wasParsingEnabled) {
                await this.startParserForAccount(account);
              } else if (!account.parsingEnabled && wasParsingEnabled) {
                await this.stopParserForAccount(account);
              }
            }
          }
        } catch (error) {
          console.error('Error in change stream handler:', error);
        }
      });

      changeStream.on("error", (error) => {
        console.error('Change stream error:', error);
      });

    } catch (error) {
      console.error('Error setting up change stream:', error);
    }
  }

  // Публичные методы для управления парсером
  async enableParsingForAccount(accountId: string) {
    try {
      const account = await this.accountModel.findOne({ id: accountId });
      if (account) {
        await this.accountModel.updateOne(
          { id: accountId },
          { parsingEnabled: true }
        );

        if (!this.handlers.has(accountId)) {
          await this.startParserForAccount(account);
        }
      }
    } catch (error) {
      console.error(`Error enabling parsing for account ${accountId}:`, error);
      throw error;
    }
  }

  async disableParsingForAccount(accountId: string) {
    try {
      await this.accountModel.updateOne(
        { id: accountId },
        { parsingEnabled: false }
      );

      const account = await this.accountModel.findOne({ id: accountId });
      if (account && this.handlers.has(accountId)) {
        await this.stopParserForAccount(account);
      }
    } catch (error) {
      console.error(`Error disabling parsing for account ${accountId}:`, error);
      throw error;
    }
  }

  async getParsingStatus() {
    try {
      const activeAccounts = await this.accountModel.find({ parsingEnabled: true });
      const status = {
        totalAccounts: activeAccounts.length,
        activeHandlers: this.handlers.size,
        accounts: activeAccounts.map(account => ({
          id: account.id,
          name: account.name,
          username: account.username,
          status: account.status,
          hasHandler: this.handlers.has(account.id)
        }))
      };

      return status;
    } catch (error) {
      console.error('Error getting parsing status:', error);
      throw error;
    }
  }
}