import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { TelegramMessage } from "./models/message.model";
import { User } from "src/users/models/user.schema";
import { ReqFilters } from "src/decorators/ReqFilters";
import { filteredRequest } from "src/utils/filteredRequests";

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(TelegramMessage.name) private readonly messageModel: Model<TelegramMessage>
  ) { }

  async getUserMessages(filters: ReqFilters, user: User) {
    try {
      const query = { user: user._id };

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
      throw new BadRequestException('Failed to get messages');
    }
  }

  async getFilteredMessages(filters: ReqFilters, user: User) {
    try {
      const query = {
        user: user._id,
        filtered: { $exists: true, $ne: [] }
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
      throw new BadRequestException('Failed to get filtered messages');
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
      const baseQuery = { user: user._id };

      if (filters.startDate && filters.endDate) {
        baseQuery['createdAt'] = {
          $gte: new Date(filters.startDate).getTime(),
          $lte: new Date(filters.endDate).getTime()
        };
      }

      const totalMessages = await this.messageModel.countDocuments(baseQuery);

      const filteredMessages = await this.messageModel.countDocuments({
        ...baseQuery,
        filtered: { $exists: true, $ne: [] }
      });

      const filterStats = await this.messageModel.aggregate([
        { $match: baseQuery },
        { $unwind: '$filtered' },
        {
          $group: {
            _id: '$filtered',
            count: { $sum: 1 },
            filterName: { $first: '$filterNames' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

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
        filteredPercentage: totalMessages > 0 ? (filteredMessages / totalMessages * 100).toFixed(2) : 0,
        topFilters: filterStats,
        topAccounts: accountStats
      };
    } catch (error) {
      throw new BadRequestException('Failed to get messages statistics');
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
}