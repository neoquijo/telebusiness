import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { TelegramMessage } from "./models/message.model";
import { User } from "src/users/models/user.schema";
import { ReqFilters } from "src/decorators/ReqFilters";
import { filteredRequest } from "src/utils/filteredRequests";
import { NormalizedMessage } from "src/filters/models/telegram-message.dto";
import { MessageFilterService } from "src/filters/message-filter.service";

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(TelegramMessage.name) private readonly messageModel: Model<TelegramMessage>,
    private readonly filterService: MessageFilterService
  ) { }

  async getUserMessages(filters: ReqFilters, user: User) {
    try {
      const query = { user: user._id };

      if (filters.searchQuery) {
        query['messageText'] = { "$regex": filters.searchQuery, "$options": "i" };
      }
      const filteredMessages = await filteredRequest(
        this.messageModel,
        filters,
        query,
        [{ path: 'filtered', select: 'name callbackTopic id' }]
      );

      return {
        ...filteredMessages,
        items: [...filteredMessages.items]
      };
    } catch (error) {
      throw new BadRequestException('Failed to get messages');
    }
  }

  async getFilteredMessages(filters: ReqFilters, user: User) {
    try {
      const query: any = {
        user: user._id
      };

      if (filters.searchQuery) {
        query.messageText = { "$regex": filters.searchQuery, "$options": "i" };
      }

      // Проверяем наличие фильтров
      if (!filters.filters || !filters.filters.length) {
        // Если фильтры не указаны, ищем все фильтрованные сообщения
        query.filtered = { $exists: true, $ne: [] };
      } else {
        // Получаем массив ID фильтров
        const filterIds = filters.filters.split(',');

        // Находим фильтры пользователя по их ID
        const userFilters = await this.filterService.getFiltersByIds(filterIds, user);

        if (userFilters && userFilters.length > 0) {
          // Извлекаем ObjectId найденных фильтров
          const filterObjectIds = userFilters.map(filter => filter._id);
          
          // Ищем сообщения с указанными фильтрами
          query.filtered = { $in: filterObjectIds };
        } else {
          // Если не найдено ни одного фильтра, возвращаем пустой результат
          return {
            currentPage: 1,
            pageSize: filters.limit || 10,
            totalItems: 0,
            totalPages: 0,
            items: []
          };
        }
      }

      // Получаем отфильтрованные сообщения
      const filteredMessages = await filteredRequest(
        this.messageModel,
        filters,
        query,
        [{ path: 'filtered', select: 'name callbackTopic id' }]
      );
      
      // Сортировка результатов
      return {
        ...filteredMessages,
        items: [...filteredMessages.items].reverse()
      };
    } catch (error) {
      console.error('Failed to get filtered messages:', error);
      throw new BadRequestException('Failed to get filtered messages: ' + error.message);
    }
  }

  async getMessagesByFilter(filterId: string, filters: ReqFilters, user: User) {
    try {
      const query = {
        user: user._id,
        filtered: filterId
      };

      if (filters.searchQuery) {
        query['messageText'] = { "$regex": filters.searchQuery, "$options": "i" };
      }

      return await filteredRequest(
        this.messageModel,
        filters,
        query,
        [
          { path: 'filtered', select: 'name callbackTopic' }
        ]
      );
    } catch (error) {
      throw new BadRequestException('Failed to get messages by filter');
    }
  }

  async getMessageById(id: string, user: User) {
    try {
      const message = await this.messageModel
        .findOne({ id, user: user._id })
        .populate('filtered', 'name callbackTopic');

      if (!message) {
        throw new NotFoundException('Message not found');
      }

      return message;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to get message');
    }
  }

  async getMessagesStatistics(filters: ReqFilters, user: User) {
    try {
      const baseQuery: any = { user: user._id };
  
      // Обрабатываем временные метки Unix (в секундах)
      if (filters.from || filters.to) {
        const query: any = {};
        
        if (filters.from) {
          query.$gte = filters.from * 1000;
        }
        
        if (filters.to) {
          query.$lte = filters.to * 1000;
        }
        
        baseQuery.createdAt = query;
      }
  
      // Параллельно выполняем основные запросы
      const [totalMessages, filteredMessages] = await Promise.all([
        this.messageModel.countDocuments(baseQuery),
        this.messageModel.countDocuments({
          ...baseQuery,
          filtered: { $exists: true, $ne: [] }
        })
      ]);
  
      // Статистика по фильтрам с учетом периода
      const filterStats = await this.messageModel.aggregate([
        { $match: baseQuery },
        { $unwind: { path: '$filtered', preserveNullAndEmptyArrays: false } },
        {
          $lookup: {
            from: 'messagefilters',
            localField: 'filtered',
            foreignField: '_id',
            as: 'filterInfo'
          }
        },
        { $unwind: '$filterInfo' },
        {
          $group: {
            _id: '$filtered',
            count: { $sum: 1 },
            filterName: { $first: '$filterInfo.name' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);
  
      // Статистика по аккаунтам с учетом периода
      const accountStats = await this.messageModel.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$accountString',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);
  
      return {
        totalMessages,
        filteredMessages,
        filteredPercentage: totalMessages > 0 
          ? Number((filteredMessages / totalMessages * 100).toFixed(2)) 
          : 0,
        topFilters: filterStats,
        topAccounts: accountStats
      };
    } catch (error) {
      throw new BadRequestException('Ошибка получения статистики: ' + error.message);
    }
  }

  async createMessage(messageData: Partial<TelegramMessage>) {
    try {
      return await this.messageModel.create(messageData);
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  async updateMessage(id: string, updateData: Partial<TelegramMessage>) {
    try {
      return await this.messageModel.findOneAndUpdate(
        { id },
        updateData,
        { new: true }
      );
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  }

  async getMessagesForFilter(filterId: Types.ObjectId, limit = 100, aiProcessed = false) {
    return await this.messageModel.find({
      filtered: filterId,
      aiProcessed
    })
      .sort({ createdAt: 1 })
      .limit(limit)
      .exec();
  }

  async markMessagesAsProcessed(messageIds: string[]) {
    return await this.messageModel.updateMany(
      { id: { $in: messageIds } },
      { aiProcessed: true }
    );
  }

  normalizeMessage(message: TelegramMessage): NormalizedMessage {
    return {
      id: message.id,
      text: String(message.messageText),
      sender: Number(message.sender),
      senderUsername: '',  // Would need to be populated from Telegram
      chatId: Number(message.accountId),
      chatTitle: '',  // Would need to be populated from Telegram
      chatType: message.sourceType,
      media: message.messageMedia || [],
      sentAt: new Date(message.createdAt)
    };
  }

  async handleMessage(event: any) {
    console.log(event);
  }
}