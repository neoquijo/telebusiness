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
      console.log(searchQuery)
      console.log(query)

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

      // Для каналов и чатов
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
      // Для пользователей
      else if (entity instanceof Api.User) {
        if (entity.photo instanceof Api.UserProfilePhoto) {
          buffer = await client.downloadProfilePhoto(entity, { isBig: false });
        } else {
          return null;
        }
      }
      // Для других типов
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
          description: chat.description || '', // Используем описание из входных данных
          type: chat.type == 'Channel' ? chat.broadcast == false ? 'Chat' : 'Channel' : chat.type, // Тип должен приходить из импорта
          broadcast: !chat.canSendMessages,
          chatId: chat.id,
          isPublic: imports.makePublic,
          importedFrom: account._id,
          user: user._id,
          collection: chatCollectionId,
          chatImage: null, // Убрали привязку к изображению
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

  // async importChats(imports: ChatImports, user: User, accountId: string) {
  //   let importedChats: Array<Chat> = [];
  //   try {
  //     const account = await this.accounts.getAccount(accountId);
  //     const client = this.accountsStorage.getClient(accountId);
  //     if (!client) {
  //       throw new BadRequestException('Account client not available');
  //     }

  //     let chatCollectionId = null;
  //     if (imports.collectionName) {
  //       const collection = await this.chatCollectionsModel.create({
  //         name: imports.collectionName,
  //         user: user._id,
  //         createdAt: new Date(),
  //         updatedAt: new Date()
  //       });
  //       chatCollectionId = collection._id;
  //     }

  //     const chatPromises = imports.chats.map(async (chat) => {
  //       const existingChat = await this.chatModel.findOne({
  //         chatId: chat.id,
  //         user: user._id
  //       });

  //       if (existingChat) {
  //         return null;
  //       }

  //       let chatType = chat.type;
  //       let chatImage = null;
  //       let description = '';

  //       try {
  //         const projectRoot = process.cwd();
  //         const chatDir = path.join(projectRoot, 'images', 'chats', String(chat.id));
  //         this.ensureDirectoryExistsRecursive(chatDir);
  //         const secureId = generateSecureUniqueID() + '.webp';
  //         const imagePath = path.join(chatDir, secureId);

  //         const entity = await client.getEntity(chat.id);

  //         // Обработка каналов и супергрупп
  //         if (entity instanceof Api.Channel) {
  //           const fullChat = await client.invoke(
  //             new Api.channels.GetFullChannel({ channel: chat.id })
  //           );

  //           if (fullChat.fullChat instanceof Api.ChannelFull) {
  //             description = fullChat.fullChat.about || '';
  //           }

  //           if (entity.photo instanceof Api.ChatPhoto) {
  //             const buffer = await client.downloadFile(
  //               new Api.InputPeerPhotoFileLocation({
  //                 big: false,
  //                 //@ts-ignore
  //                 peer: entity,
  //                 photoId: entity.photo.photoId
  //               })
  //             );

  //             if (buffer?.length) {
  //               fs.writeFileSync(imagePath, buffer);
  //               chatImage = secureId;
  //             }
  //           }

  //           chatType = entity.megagroup ? 'Supergroup' : 'Channel';
  //         }

  //         // Обработка пользователей и ботов
  //         else if (entity instanceof Api.User) {
  //           if (entity.photo instanceof Api.UserProfilePhoto) {
  //             const buffer = await client.downloadProfilePhoto(entity, { isBig: false });
  //             if (buffer?.length) {
  //               fs.writeFileSync(imagePath, buffer);
  //               chatImage = secureId;
  //             }
  //           }

  //           description = entity.bot ? 'Bot' : entity.firstName || '';
  //           chatType = entity.bot ? 'Bot' : 'Private';
  //         }

  //         // Обработка обычных чатов
  //         else if (entity instanceof Api.Chat) {
  //           if (entity.photo instanceof Api.ChatPhoto) {
  //             const buffer = await client.downloadFile(
  //               new Api.InputPeerPhotoFileLocation({
  //                 big: false,
  //                 //@ts-ignore
  //                 peer: entity,
  //                 photoId: entity.photo.photoId
  //               })
  //             );

  //             if (buffer?.length) {
  //               fs.writeFileSync(imagePath, buffer);
  //               chatImage = secureId;
  //             }
  //           }

  //           chatType = 'Group';
  //         }

  //       } catch (error) {
  //         console.error(`Error processing chat ${chat.id}:`, error);
  //       }

  //       const newChat = new this.chatModel({
  //         title: chat.title,
  //         description: description,
  //         type: chatType,
  //         broadcast: !chat.canSendMessages,
  //         chatId: chat.id,
  //         isPublic: imports.makePublic,
  //         importedFrom: account._id,
  //         user: user._id,
  //         collection: chatCollectionId,
  //         chatImage: chatImage,
  //         createdAt: new Date(),
  //         updatedAt: new Date()
  //       });

  //       return newChat.save();
  //     });

  //     const results = await Promise.all(chatPromises);
  //     importedChats = results.filter(result => result !== null);
  //     return importedChats;
  //   } catch (error) {
  //     console.error('Error importing chats:', error);
  //     throw new BadRequestException('Failed to import chats');
  //   }
  // }

  // private ensureDirectoryExistsRecursive(dirPath: string) {
  //   if (!fs.existsSync(dirPath)) {
  //     fs.mkdirSync(dirPath, { recursive: true });
  //     console.log(`Created directory: ${dirPath}`);
  //   }
  // }
}