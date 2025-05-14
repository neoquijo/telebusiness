import { StringSession } from "telegram/sessions";

export interface TelegramClientConfig {
  session: StringSession;
  apiId: number;
  apiHash: string;
  connectionRetries?: number;
}