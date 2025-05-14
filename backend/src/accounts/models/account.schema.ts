import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";
import { BaseDocument } from "src/Base/BaseDocument";

@Schema()
export class Account extends BaseDocument {
  @Prop()
  name: string;

  @Prop()
  sessionData: string;

  @Prop()
  accountId: number;

  @Prop()
  username: string;

  @Prop()
  firstname: string;

  @Prop()
  lastname: string;

  @Prop()
  category: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop()
  phone: string;

  @Prop({ enum: ["alive", "expired", "error"], default: "alive" })
  status: string;

  @Prop({ default: false })
  parsingEnabled: boolean;
}

export const accountSchema = SchemaFactory.createForClass(Account);