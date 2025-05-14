import { Controller } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { MessageFilter } from "./models/message-filter.schema";
import { Model } from "mongoose";
import { TelegramMessage } from "src/messages/models/message.model";

@Controller()
export class FiltersController {
  constructor(
    @InjectModel(MessageFilter.name) private readonly telegramMessageModel: Model<TelegramMessage>
  ) { }

  async createMessageFilter(data) {

  }
}