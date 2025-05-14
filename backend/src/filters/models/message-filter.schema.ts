import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BaseDocument } from "src/Base/BaseDocument";

@Schema()
export class MessageFilter extends BaseDocument {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId
  @Prop()
  includesText: Array<string>
  @Prop()
  name: string;
  @Prop()
  excludesText: Array<string>
  @Prop()
  regexp: string
  @Prop()
  callbackTopic: string;
}

export const messageFilterSchema = SchemaFactory.createForClass(MessageFilter)