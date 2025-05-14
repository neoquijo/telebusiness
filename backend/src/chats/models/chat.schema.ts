import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BaseDocument } from "src/Base/BaseDocument";

@Schema()
export class Chat extends BaseDocument {
  @Prop({ index: true })
  title: string;
  @Prop({ index: true })
  description: string;
  @Prop()
  category: string;
  @Prop()
  type: 'Channel' | 'User' | 'Group' | 'Forum' | 'Chat'
  @Prop()
  broadcast: boolean;
  @Prop()
  chatId: number;
  @Prop()
  lang: string;
  @Prop()
  isPublic: boolean;
  @Prop()
  keywords: []
  @Prop()
  chatImage: string;
  @Prop()
  country: string;
  @Prop({ type: Types.ObjectId, ref: 'Account' })
  importedFrom: Types.ObjectId
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId
}

export const chatSchema = SchemaFactory.createForClass(Chat)