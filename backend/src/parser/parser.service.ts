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
import { LeadService } from "src/leads/lead.service";
import { ArtificialIntelligenceService } from "src/artificial-intelligence/artificial-intelligence.service";

@Injectable()
export class ParserService implements OnModuleInit, OnModuleDestroy {
  private handlers: Map<string, (event: NewMessageEvent) => void> = new Map();
  private processingFilters = new Set<string>(); // Track filters currently being processed

  constructor(
    @InjectModel(Account.name) private readonly accountModel: Model<Account>,
    @InjectModel(MessageFilter.name) private readonly filterModel: Model<MessageFilter>,
    @InjectModel(TelegramMessage.name) private readonly messageModel: Model<TelegramMessage>,
    private readonly accountsStorage: AccountsStorage,
    private readonly messageFilterService: MessageFilterService,
    private readonly messagesService: MessagesService,
    private readonly aiService: ArtificialIntelligenceService,
    private readonly leadService: LeadService
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

      // Mark account as having an error
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

        // Get information about sender and chat
        let sender = null;
        let sourceType: 'Chat' | 'Channel' | 'Private' | 'Group' = 'Private';

        try {
          sender = await message.getSender();
          const chat = await message.getChat();

          if (chat) {
            // Determine the type of chat
            if (chat instanceof Api.Channel) {
              sourceType = chat.megagroup ? 'Group' : 'Channel';
            } else if (chat instanceof Api.Chat) {
              sourceType = 'Group';
            } else if (chat instanceof Api.User) {
              sourceType = 'Private';
            } else {

              // Fallback to className
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

        // Create the message object
        const telegramMessage = new this.messageModel({
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
          lang: null, // Will be determined by AI
          aiProcessed: false
        });

        // Get the user's filters
        const filters = await this.messageFilterService.getUserFiltersForAccount(account.user.toString());

        const matchingFilters: MessageFilter[] = [];

        // Check message against each filter
        for (const filter of filters) {
          if (this.messageFilterService.checkFilterMatches(
            messageText,
            filter,
            telegramMessage.messageMedia
          )) {
            telegramMessage.filtered.push(filter._id);
            telegramMessage.filterNames.push(filter.name);
            matchingFilters.push(filter);

            console.log(`Filter matched: ${filter.name}, message: ${messageText.substring(0, 100)}...`);
          }
        }

        // Save the message
        await telegramMessage.save();

        // Process batch for each matching filter
        for (const filter of matchingFilters) {
          // Update filter batch counters
          const updatedFilter = await this.messageFilterService.incrementBatchCounters(filter, messageText);

          // Check if batch limits reached
          if (updatedFilter) {
            const batchLimitsReached = await this.messageFilterService.checkBatchLimits(updatedFilter);

            if (batchLimitsReached) {
              // Process batch if not already processing this filter
              if (!this.processingFilters.has(updatedFilter.id)) {
                this.processBatch(updatedFilter);
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error processing message from account ${account.id}:`, error);
      }
    };
  }

  private async processBatch(filter: MessageFilter) {
    try {
      // Mark filter as being processed
      this.processingFilters.add(filter.id);

      console.log(`Processing batch for filter: ${filter.name}`);

      // Get unprocessed messages for this filter
      const messages = await this.messagesService.getMessagesForFilter(
        filter._id,
        filter.batchSizeMessages,
        false // not AI processed
      );

      if (messages.length === 0) {
        console.log(`No unprocessed messages for filter: ${filter.name}`);
        this.processingFilters.delete(filter.id);
        return;
      }

      console.log(`Found ${messages.length} messages to process for filter: ${filter.name}`);

      // Normalize messages for AI
      const normalizedMessages = messages.map(msg => this.messagesService.normalizeMessage(msg));

      // Process with AI
      const analysisResults = await this.aiService.analyzeMessages(normalizedMessages, filter.matchGoal);

      console.log(`Received ${analysisResults.length} analysis results for filter: ${filter.name}`);

      // Process AI results
      for (let i = 0; i < analysisResults.length; i++) {
        const result = analysisResults[i];
        const message = messages[i];

        // Check if it's a lead
        if (result.isLead) {
          console.log(`Lead found! Message ID: ${message.id}, Filter: ${filter.name}`);

          // Create a lead
          await this.leadService.createLeadFromAnalysis(result, filter._id, message);
        }
      }

      // Mark messages as processed
      await this.messagesService.markMessagesAsProcessed(messages.map(msg => msg.id));

      // Reset batch counters
      await this.messageFilterService.resetBatchCounters(filter._id.toString());

      console.log(`Batch processing completed for filter: ${filter.name}`);
    } catch (error) {
      console.error(`Error processing batch for filter ${filter.name}:`, error);
    } finally {
      // Mark filter as no longer being processed
      this.processingFilters.delete(filter.id);
    }
  }

  private setupChangeStream() {
    try {
      const accountChangeStream = this.accountModel.watch();

      accountChangeStream.on("change", async (change) => {
        try {
          console.log('changed')
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
          console.error('Error in account change stream handler:', error);
        }
      });

      // Also watch filters for changes to batch limits
      const filterChangeStream = this.filterModel.watch();

      filterChangeStream.on("change", async (change) => {
        try {
          if (change.operationType === "update" &&
            (change.updateDescription.updatedFields?.batchSizeMessages !== undefined ||
              change.updateDescription.updatedFields?.batchSizeCharacters !== undefined)) {

            const filterId = change.documentKey._id;
            const filter = await this.filterModel.findById(filterId);

            if (filter) {
              const batchLimitsReached = await this.messageFilterService.checkBatchLimits(filter);

              if (batchLimitsReached && !this.processingFilters.has(filter.id)) {
                this.processBatch(filter);
              }
            }
          }
        } catch (error) {
          console.error('Error in filter change stream handler:', error);
        }
      });
    } catch (error) {
      console.error('Error setting up change streams:', error);
    }
  }

  // Public methods for managing parsing
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
        processingFilters: Array.from(this.processingFilters),
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

  // Method to manually trigger batch processing for a filter
  async triggerBatchProcessing(filterId: string) {
    try {
      const filter = await this.filterModel.findOne({ id: filterId });

      if (!filter) {
        throw new Error(`Filter not found: ${filterId}`);
      }

      if (!this.processingFilters.has(filter.id)) {
        await this.processBatch(filter);
        return { success: true, message: `Batch processing triggered for filter: ${filter.name}` };
      } else {
        return { success: false, message: `Filter ${filter.name} is already being processed` };
      }
    } catch (error) {
      console.error(`Error triggering batch processing for filter ${filterId}:`, error);
      throw error;
    }
  }
}
