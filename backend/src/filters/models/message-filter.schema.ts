import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BaseDocument } from "src/Base/BaseDocument";

@Schema()
export class MessageFilter extends BaseDocument {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  includesText: string[];

  @Prop({ required: true })
  name: string;

  @Prop({ type: [String], default: [] })
  excludesText: string[];

  @Prop()
  regexp: string;

  @Prop()
  callbackTopic: string;
}

export const messageFilterSchema = SchemaFactory.createForClass(MessageFilter);