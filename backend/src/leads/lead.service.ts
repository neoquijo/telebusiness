import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lead } from './models/lead.schema';
import { Account } from 'src/accounts/models/account.schema';
import { TelegramMessage } from 'src/messages/models/message.model';
import { AIAnalysisResult } from 'src/filters/models/telegram-message.dto';

@Injectable()
export class LeadService {
  constructor(
    @InjectModel(Lead.name) private readonly leadModel: Model<Lead>,
    @InjectModel(Account.name) private readonly accountModel: Model<Account>,
    @InjectModel(TelegramMessage.name) private readonly messageModel: Model<TelegramMessage>
  ) { }

  async createLeadFromAnalysis(
    analysisResult: AIAnalysisResult,
    filterId: Types.ObjectId,
    message: TelegramMessage
  ): Promise<Lead> {
    try {
      // Get account information
      const account = await this.accountModel.findOne({
        accountId: message.accountId
      });

      if (!account) {
        throw new Error(`Account not found for ID: ${message.accountId}`);
      }

      // Create and save the lead
      const lead = new this.leadModel({
        user: message.user,
        account: account._id,
        message: message._id,
        messageText: message.messageText,
        sender: message.sender,
        senderUsername: analysisResult.user,
        chatId: message.accountId,
        chatTitle: '', // Would need to be populated from chat info
        chatType: message.sourceType,
        sentAt: new Date(message.createdAt), // Using message creation date
        messageType: analysisResult.messageType,
        mainCategory: analysisResult.mainCategory,
        keywords: analysisResult.keywords,
        lang: analysisResult.lang,
        isScam: analysisResult.isScam || false,
        matchedFilter: filterId,
        confidence: analysisResult.confidence || 0.5
      });

      return await lead.save();
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  }

  async getLeadsForUser(userId: Types.ObjectId) {
    return await this.leadModel.find({ user: userId })
      .populate('account')
      .populate('message')
      .populate('matchedFilter')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getLeadById(id: string) {
    return await this.leadModel.findOne({ id })
      .populate('account')
      .populate('message')
      .populate('matchedFilter')
      .exec();
  }
}
