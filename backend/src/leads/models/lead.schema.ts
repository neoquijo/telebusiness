import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BaseDocument } from "src/Base/BaseDocument";

@Schema()
export class Lead extends BaseDocument {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Account' })
  account: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'TelegramMessage' })
  message: Types.ObjectId;

  @Prop()
  messageText: string;

  @Prop()
  sender: number; // Telegram user ID

  @Prop()
  senderUsername: string;

  @Prop()
  chatId: number;

  @Prop()
  chatTitle: string;

  @Prop()
  chatType: string;

  @Prop()
  sentAt: Date;

  @Prop()
  messageType: "buyOffer" | "saleOffer" | "jobOffer" | "jobNeeded" | "serviceOffer" | "offtopic";

  @Prop()
  mainCategory: string;

  @Prop([String])
  keywords: string[];

  @Prop()
  lang: string;

  @Prop({ default: false })
  isScam: boolean;

  @Prop({ type: Types.ObjectId, ref: 'MessageFilter' })
  matchedFilter: Types.ObjectId;

  @Prop()
  confidence: number; // AI confidence score 0-1
}

export const leadSchema = SchemaFactory.createForClass(Lead);