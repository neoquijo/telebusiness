import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMessageFilterDto {
  @IsString()
  name: string;

  @IsArray()
  @IsOptional()
  includesText?: string[];

  @IsArray()
  @IsOptional()
  excludesText?: string[];

  @IsArray()
  @IsOptional()
  includesAll?: string[];

  @IsBoolean()
  @IsOptional()
  includesMedia?: boolean;

  @IsBoolean()
  @IsOptional()
  excludesMedia?: boolean;

  @IsString()
  @IsOptional()
  regexp?: string;

  @IsString()
  @IsOptional()
  callbackTopic?: string;

  @IsString()
  @IsOptional()
  matchGoal?: string;

  @IsNumber()
  @IsOptional()
  batchSizeCharacters?: number;

  @IsNumber()
  @IsOptional()
  batchSizeMessages?: number;
}

export class UpdateMessageFilterDto extends CreateMessageFilterDto { }

export interface NormalizedMessage {
  id: string;
  text: string;
  sender: number;
  senderUsername?: string;
  chatId: number;
  chatTitle: string;
  chatType: string;
  media: any[];
  sentAt: Date;
}

export interface AIAnalysisResult {
  messageId: string;
  sender: number;
  user: string;
  account: string;
  isLead: boolean;
  messageType: "buyOffer" | "saleOffer" | "jobOffer" | "jobNeeded" | "serviceOffer" | "offtopic";
  mainCategory: string;
  keywords: string[];
  lang: string;
  confidence?: number;
  isScam?: boolean;
}
