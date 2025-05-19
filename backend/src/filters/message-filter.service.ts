import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ObjectId, Types } from "mongoose";
import { MessageFilter } from "./models/message-filter.schema";
import { User } from "src/users/models/user.schema";
import { ReqFilters } from "src/decorators/ReqFilters";
import { filteredRequest } from "src/utils/filteredRequests";
import { CreateMessageFilterDto, UpdateMessageFilterDto } from "./models/telegram-message.dto";

@Injectable()
export class MessageFilterService {
  constructor(
    @InjectModel(MessageFilter.name) private readonly filterModel: Model<MessageFilter>
  ) { }

  async getUserFilters(filters: ReqFilters, user: User) {
    try {
      const query = { user: user._id };

      // Добавим поиск по названию фильтра
      if (filters.searchQuery) {
        query['name'] = { "$regex": filters.searchQuery, "$options": "i" };
      }

      return await filteredRequest(
        this.filterModel,
        filters,
        query
      );
    } catch (error) {
      throw new BadRequestException('Failed to get filters');
    }
  }

  async getFilterById(id: string, user: User) {
    try {
      const filter = await this.filterModel.findOne({ id, user: user._id });

      if (!filter) {
        throw new NotFoundException('Filter not found');
      }

      return filter;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to get filter');
    }
  }

  async createFilter(createDto: CreateMessageFilterDto, user: User) {
    try {
      // Валидируем regexp если он указан
      if (createDto.regexp) {
        try {
          new RegExp(createDto.regexp);
        } catch (regexError) {
          throw new BadRequestException('Invalid regular expression');
        }
      }

      const filter = await this.filterModel.create({
        ...createDto,
        user: user._id
      });

      return filter;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create filter');
    }
  }

  async updateFilter(id: string, updateDto: UpdateMessageFilterDto, user: User) {
    try {
      // Проверяем что фильтр принадлежит пользователю
      const existingFilter = await this.filterModel.findOne({ id, user: user._id });

      if (!existingFilter) {
        throw new NotFoundException('Filter not found');
      }

      // Валидируем regexp если он указан
      if (updateDto.regexp) {
        try {
          new RegExp(updateDto.regexp);
        } catch (regexError) {
          throw new BadRequestException('Invalid regular expression');
        }
      }

      const updatedFilter = await this.filterModel.findOneAndUpdate(
        { id, user: user._id },
        updateDto,
        { new: true }
      );

      return updatedFilter;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update filter');
    }
  }

  async deleteFilter(id: string, user: User) {
    try {
      const deletedFilter = await this.filterModel.findOneAndDelete({
        id,
        user: user._id
      });

      if (!deletedFilter) {
        throw new NotFoundException('Filter not found');
      }

      return { message: 'Filter deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete filter');
    }
  }

  async testFilter(id: string, messageText: string, user: User) {
    try {
      const filter = await this.getFilterById(id, user);
      const matches = this.checkFilterMatches(messageText, filter);

      return {
        filterId: filter.id,
        filterName: filter.name,
        messageText,
        matches
      };
    } catch (error) {
      throw error;
    }
  }

  // Метод для проверки соответствия сообщения фильтру (используется в парсере)
  checkFilterMatches(messageText: string, filter: MessageFilter): boolean {
    // Проверяем включающий текст
    if (filter.includesText && filter.includesText.length > 0) {
      for (const text of filter.includesText) {
        if (!messageText.toLowerCase().includes(text.toLowerCase())) {
          return false;
        }
      }
    }

    // Проверяем исключающий текст
    if (filter.excludesText && filter.excludesText.length > 0) {
      for (const text of filter.excludesText) {
        if (messageText.toLowerCase().includes(text.toLowerCase())) {
          return false;
        }
      }
    }

    // Проверяем регулярное выражение
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

  // Метод для получения всех фильтров пользователя (используется в парсере)
  async getUserFiltersForAccount(userId: Types.ObjectId) {
    try {
      return await this.filterModel.find({ user: userId });
    } catch (error) {
      console.error('Error getting user filters:', error);
      return [];
    }
  }
}