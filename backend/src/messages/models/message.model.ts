import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BaseDocument } from "src/Base/BaseDocument";

@Schema()
export class TelegramMessage extends BaseDocument {
  @Prop()
  sender: Number;

  @Prop()
  sourceType: 'Chat' | 'Channel' | 'Private' | 'Group';

  @Prop()
  accountId: Number;

  @Prop()
  generatedTags: Array<string>;

  @Prop()
  lang: string;

  @Prop()
  accountString: String;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop()
  messageMedia: [];

  @Prop()
  messageText: String;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'MessageFilter' }] })
  filtered: Types.ObjectId[];

  @Prop({ type: [String] })
  filterNames: string[];

  @Prop({ default: false })
  aiProcessed: boolean;
}

export const telegramMessageSchema = SchemaFactory.createForClass(TelegramMessage);