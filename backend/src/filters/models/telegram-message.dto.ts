import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateMessageFilterDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includesText?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludesText?: string[];

  @IsOptional()
  @IsString()
  regexp?: string;

  @IsOptional()
  @IsString()
  callbackTopic?: string;
}

export class UpdateMessageFilterDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includesText?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludesText?: string[];

  @IsOptional()
  @IsString()
  regexp?: string;

  @IsOptional()
  @IsString()
  callbackTopic?: string;
}

export class TestFilterDto {
  @IsString()
  messageText: string;
}