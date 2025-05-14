import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BaseDocument } from "src/Base/BaseDocument";

@Schema({ collection: 'ChatCollection' })
export class ChatCollection extends BaseDocument {
  @Prop()
  id: string;
  @Prop()
  name: string;
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Chat' }] })
  chats: [Types.ObjectId]
  @Prop({ type: Types.ObjectId, ref: 'User' })
  importedBy: Types.ObjectId
  @Prop()
  isPrivate: boolean;
}

export const chatCollectionSchema = SchemaFactory.createForClass(ChatCollection)