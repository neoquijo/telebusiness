import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";
import { BaseDocument } from "src/Base/BaseDocument";

export type TaskType = "parser" | "sender";
export type TaskStatus = "running" | "paused" | "completed" | "stopped" | "error";

@Schema({ timestamps: true })
export class Task extends BaseDocument {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ["parser", "sender"] })
  type: TaskType;

  @Prop({ required: true, enum: ["running", "paused", "completed", "stopped", "error"], default: "stopped" })
  status: TaskStatus;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Account' }] })
  accounts: Types.ObjectId[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ type: Object })
  config: Record<string, any>;

  @Prop()
  lastExecutedAt: Date;

  @Prop()
  error: string;

  @Prop({ default: 0 })
  processedItems: number;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
