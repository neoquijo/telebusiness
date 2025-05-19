import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MessageFilter } from './models/message-filter.schema';
import { ReqFilters } from 'src/decorators/ReqFilters';
import { User } from 'src/users/models/user.schema';
import { filteredRequest } from 'src/utils/filteredRequests';
import { CreateMessageFilterDto, UpdateMessageFilterDto } from './models/telegram-message.dto';

@Injectable()
export class MessageFilterService {
  constructor(
    @InjectModel(MessageFilter.name)
    private readonly messageFilterModel: Model<MessageFilter>
  ) { }

  async getUserFilters(filters: ReqFilters, user: User) {
    return await filteredRequest(
      this.messageFilterModel,
      filters,
      { user: user._id }
    );
  }

  async getUserFiltersForAccount(userId: string) {
    return await this.messageFilterModel.find({ user: new Types.ObjectId(userId) }).exec();
  }

  async getFilterById(id: string, user: User) {
    return await this.messageFilterModel.findOne({
      id,
      user: user._id
    }).exec();
  }

  async createFilter(createDto: CreateMessageFilterDto, user: User) {
    const filter = new this.messageFilterModel({
      ...createDto,
      user: user._id,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return await filter.save();
  }

  async updateFilter(id: string, updateDto: UpdateMessageFilterDto, user: User) {
    return await this.messageFilterModel.findOneAndUpdate(
      { id, user: user._id },
      { ...updateDto, updatedAt: new Date() },
      { new: true }
    ).exec();
  }

  async deleteFilter(id: string, user: User) {
    return await this.messageFilterModel.findOneAndDelete({
      id,
      user: user._id
    }).exec();
  }

  async testFilter(id: string, messageText: string, user: User) {
    const filter = await this.messageFilterModel.findOne({
      id,
      user: user._id
    }).exec();

    if (!filter) {
      return { matches: false, error: 'Filter not found' };
    }

    const matches = this.checkFilterMatches(messageText, filter, []);
    return { matches, filter };
  }

  async incrementBatchCounters(filter: MessageFilter, messageText: string) {
    const charLength = messageText.length;

    const updatedFilter = await this.messageFilterModel.findOneAndUpdate(
      { _id: filter._id },
      {
        $inc: {
          currentCharactersLength: charLength,
          currentMessagesLength: 1
        }
      },
      { new: true }
    );

    return updatedFilter;
  }

  async resetBatchCounters(filterId: string) {
    return await this.messageFilterModel.updateOne(
      { _id: filterId },
      { currentCharactersLength: 0, currentMessagesLength: 0 }
    );
  }

  async checkBatchLimits(filter: MessageFilter): Promise<boolean> {
    return (
      filter.currentCharactersLength >= filter.batchSizeCharacters ||
      filter.currentMessagesLength >= filter.batchSizeMessages
    );
  }

  checkFilterMatches(messageText: string, filter: MessageFilter, media: any[] = []): boolean {
    // Check includes text condition
    if (filter.includesText && filter.includesText.length > 0) {
      const hasIncluded = filter.includesText.some(text =>
        messageText.toLowerCase().includes(text.toLowerCase())
      );
      if (!hasIncluded) return false;
    }

    // Check excludes text condition
    if (filter.excludesText && filter.excludesText.length > 0) {
      const hasExcluded = filter.excludesText.some(text =>
        messageText.toLowerCase().includes(text.toLowerCase())
      );
      if (hasExcluded) return false;
    }

    // Check includes all condition (all words must be present)
    if (filter.includesAll && filter.includesAll.length > 0) {
      const allIncluded = filter.includesAll.every(text =>
        messageText.toLowerCase().includes(text.toLowerCase())
      );
      if (!allIncluded) return false;
    }

    // Check media conditions
    const hasMedia = media && media.length > 0;

    // Check includes media condition
    if (filter.includesMedia && !hasMedia) {
      return false;
    }

    // Check excludes media condition
    if (filter.excludesMedia && hasMedia) {
      return false;
    }

    // Check regexp condition
    if (filter.regexp) {
      try {
        const regex = new RegExp(filter.regexp, 'i');
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
}
