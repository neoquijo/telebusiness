import { TelegramClientConfig } from "src/telegram/types";
import { TelegramClient } from "telegram";
import { NewMessage, NewMessageEvent } from "telegram/events";
import { StringSession } from "telegram/sessions";

type ClientStatus = "error" | "active" | "inactive" | "connecting";

export class BaseTelegramClient extends TelegramClient {
  private _status: ClientStatus = "inactive";
  private messageHandlers: Set<(event: NewMessageEvent) => void> = new Set();

  constructor(clientConfig: TelegramClientConfig) {
    super(
      clientConfig.session,
      clientConfig.apiId,
      clientConfig.apiHash,
      {
        connectionRetries: clientConfig.connectionRetries || 5,
      }
    );
  }

  public get status(): ClientStatus {
    return this._status;
  }

  private set status(value: ClientStatus) {
    this._status = value;
  }

  async initialize(): Promise<void> {
    if (this.status === "active" || this.status === "connecting") {
      return;
    }

    this.status = "connecting";
    try {
      await this.connect();
      this.status = "active";
      this.startMessageHandlers();
    } catch (error) {
      this.status = "error";
      throw error;
    }
  }

  private startMessageHandlers() {
    this.addEventHandler(
      (event: NewMessageEvent) => {
        for (const handler of this.messageHandlers) {
          handler(event);
        }
      },
      new NewMessage({})
    );
  }

  addMessageHandler(handler: (event: NewMessageEvent) => void): void {
    this.messageHandlers.add(handler);
  }

  removeMessageHandler(handler: (event: NewMessageEvent) => void): void {
    this.messageHandlers.delete(handler);
  }

  async disconnect(): Promise<void> {
    try {
      await super.disconnect();
      this.status = "inactive";
    } catch (error) {
      this.status = "error";
      throw error;
    }
  }
}