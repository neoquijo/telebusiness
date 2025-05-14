import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { BaseDocument } from "src/Base/BaseDocument";

@Schema()
export class User extends BaseDocument {
  @Prop()
  login: string;
  @Prop()
  role: string;
  @Prop()
  firstname: string;
  @Prop()
  password: string;
  @Prop({ unique: true })
  email: string;
  @Prop({ unique: true })
  phone: string;
  @Prop()
  manages: [string]
  @Prop()
  centres: [mongoose.Schema.Types.ObjectId]
}

export const userSchema = SchemaFactory.createForClass(User)