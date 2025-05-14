import { Prop } from "@nestjs/mongoose";
import mongoose, { Document, Types } from "mongoose";
import { generateSecureUniqueID } from "src/utils/secureId";

export class BaseDocument extends Document {
  _id: Types.ObjectId;
  @Prop({ default: () => generateSecureUniqueID() })
  id: string;
  @Prop({ default: () => new Date().getTime() })
  createdAt: number
  @Prop()
  updatedAte: number;
}

export type DocRef = mongoose.Schema.Types.ObjectId