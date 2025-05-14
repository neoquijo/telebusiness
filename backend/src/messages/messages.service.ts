import { Injectable } from "@nestjs/common";
import { Account } from "src/accounts/models/account.schema";
import { NewMessageEvent } from "telegram/events";

@Injectable()
export class MessagesService {
  async handleMessage(message: NewMessageEvent) {
    console.log(message)
  }
}