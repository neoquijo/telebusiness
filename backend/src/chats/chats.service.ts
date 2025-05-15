// src/chats/chats.service.ts
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Chat } from "./models/chat.schema";
import { ChatCollection } from "./models/ChatCollection.schema";
import { ReqFilters } from "src/decorators/ReqFilters";
import { User } from "src/users/models/user.schema";
import { filteredRequest } from "src/utils/filteredRequests";
import { ChatImports } from "./types";
import { AccountsService } from "src/accounts/accounts.service";
import { AccountsStorage } from "src/accounts/accounts.storage";
import * as fs from 'fs';
import * as path from 'path';
import { Api } from "telegram";
import { generateSecureUniqueID } from "src/utils/secureId";

@Injectable()
export class ChatsService {
  constructor(
    @InjectModel('Chat') private readonly chatModel: Model<Chat>,
    @InjectModel('ChatCollection') private readonly chatCollectionsModel: Model<ChatCollection>,
    private readonly accounts: AccountsService,
    private readonly accountsStorage: AccountsStorage
  ) { }

  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  private normalizeEntityType(type: string): string {
    // Приводим типы Telegram API к нашим внутренним типам
    switch (type) {
      case 'Channel':
        return 'Channel';
      case 'User':
      case 'UserEmpty':
        return 'User';
      case 'Chat':
      case 'ChatEmpty':
      case 'ChatForbidden':
        return 'Chat';
      case 'ChannelForbidden':
        return 'Channel';
      default:
        return type;
    }
  }

  async getUserChats(filters: ReqFilters, user: User) {
    try {
      const searchQuery = filters.searchQuery;
      const typeFilter = filters.type ? { type: filters.type } : {};

      const searchFilter = searchQuery ? {
        $or: [
          { title: { "$regex": searchQuery, "$options": "i" } },
          { description: { "$regex": searchQuery, "$options": "i" } },
          { 'username': { "$regex": searchQuery, "$options": "i" } }
        ]
      } : {};

      const query = {
        user: user._id,
        ...typeFilter,
        ...searchFilter
      };

      return await filteredRequest(
        this.chatModel,
        filters,
        query,
      );
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Failed to get chats');
    }
  }

  async getPublicChats(filters: ReqFilters) {
    try {
      const chats = await filteredRequest(this.chatModel, filters, { isPublic: true }, []);
      return chats;
    } catch (error) {
      throw new BadRequestException('Failed to get public chats');
    }
  }

  private async downloadAndSaveChatImage(client: any, entity: any, chatId: number): Promise<string | null> {
    try {
      if (!entity.photo) return null;

      const projectRoot = process.cwd();
      const chatDir = path.join(projectRoot, 'images', 'chats', String(chatId));
      this.ensureDirectoryExists(chatDir);
      const secureId = generateSecureUniqueID() + '.webp';
      const imagePath = path.join(chatDir, secureId);

      let buffer: Buffer;

      if (entity instanceof Api.Channel || entity instanceof Api.Chat) {
        if (entity.photo instanceof Api.ChatPhoto) {
          buffer = await client.downloadFile(
            new Api.InputPeerPhotoFileLocation({
              big: false,
              //@ts-ignore
              peer: entity,
              photoId: entity.photo.photoId
            })
          );
        } else {
          return null;
        }
      }
      else if (entity instanceof Api.User) {
        if (entity.photo instanceof Api.UserProfilePhoto) {
          buffer = await client.downloadProfilePhoto(entity, { isBig: false });
        } else {
          return null;
        }
      }
      else {
        return null;
      }

      if (buffer?.length) {
        fs.writeFileSync(imagePath, buffer);
        return secureId;
      }

      return null;
    } catch (error) {
      console.error(`Error downloading image for chat ${chatId}:`, error);
      return null;
    }
  }

  async importChats(imports: ChatImports, user: User, accountId: string) {
    let importedChats: Array<Chat> = [];
    try {
      const account = await this.accounts.getAccount(accountId);

      let chatCollectionId = null;
      if (imports.collectionName) {
        const collection = await this.chatCollectionsModel.create({
          name: imports.collectionName,
          user: user._id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        chatCollectionId = collection._id;
      }

      const chatPromises = imports.chats.map(async (chat) => {
        const existingChat = await this.chatModel.findOne({
          chatId: chat.id,
          user: user._id
        });

        if (existingChat) return null;

        const newChat = new this.chatModel({
          title: chat.title,
          description: chat.description || '',
          type: this.normalizeEntityType(chat.type),
          broadcast: !chat.canSendMessages,
          chatId: chat.id,
          isPublic: imports.makePublic,
          importedFrom: account._id,
          user: user._id,
          collection: chatCollectionId,
          chatImage: null,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        return newChat.save();
      });

      const results = await Promise.all(chatPromises);
      importedChats = results.filter(result => result !== null);
      return importedChats;
    } catch (error) {
      console.error('Error importing chats:', error);
      throw new BadRequestException('Failed to import chats');
    }
  }
}