import { IsNumber, IsOptional, IsString, IsArray, IsEnum } from 'class-validator';

export class CreateTelegramMessageDto {
  @IsOptional()
  @IsNumber()
  sender?: number;

  @IsOptional()
  @IsEnum(['Chat', 'Channel', 'Private', 'Group'])
  sourceType?: 'Chat' | 'Channel' | 'Private' | 'Group';

  @IsNumber()
  accountId: number;

  @IsString()
  accountString: string;

  @IsOptional()
  @IsArray()
  messageMedia?: any[];

  @IsString()
  messageText: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  generatedTags?: string[];

  @IsOptional()
  @IsString()
  lang?: string;
}

export class MessageSearchDto {
  @IsOptional()
  @IsString()
  searchQuery?: string;

  @IsOptional()
  @IsString()
  accountId?: string;

  @IsOptional()
  @IsString()
  filterId?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsEnum(['Chat', 'Channel', 'Private', 'Group'])
  sourceType?: 'Chat' | 'Channel' | 'Private' | 'Group';
}