import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BaseDocument } from "src/Base/BaseDocument";

@Schema()
export class MessageFilter extends BaseDocument {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop()
  name: string;

  @Prop()
  includesText: Array<string>;

  @Prop()
  excludesText: Array<string>;

  @Prop()
  includesAll: Array<string>; // New field - all words must be present

  @Prop({ default: false })
  includesMedia: boolean; // New field - message must include media

  @Prop({ default: false })
  excludesMedia: boolean; // New field - message must not include media

  @Prop()
  regexp: string;

  @Prop()
  callbackTopic: string;

  @Prop()
  matchGoal: string; // AI matching goal description

  @Prop({ default: 3000 })
  batchSizeCharacters: number; // Characters limit for batch processing

  @Prop({ default: 100 })
  batchSizeMessages: number; // Messages limit for batch processing

  @Prop({ default: 0 })
  currentCharactersLength: number; // Current accumulated characters count

  @Prop({ default: 0 })
  currentMessagesLength: number; // Current accumulated messages count
}

export const messageFilterSchema = SchemaFactory.createForClass(MessageFilter);