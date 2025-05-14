import { BaseTelegramClient } from "src/Base/BaseClient";
import { TelegramClientConfig } from "./types";

export class TelegramClientFactory {
  private static instances: Map<string, BaseTelegramClient> = new Map();
  public static async createClient(
    id: string,
    config: TelegramClientConfig
  ): Promise<BaseTelegramClient> {
    if (this.instances.has(id)) {
      throw new Error(`Client with id ${id} already exists`);
    }

    const client = new BaseTelegramClient(config);
    await client.initialize();
    this.instances.set(id, client);
    return client;
  }

  public static async getClient(
    id: string
  ): Promise<BaseTelegramClient | undefined> {
    console.log(id)
    const client = this.instances.get(id);
    if (client && client.status !== "active") {
      await client.initialize();
    }
    return client;
  }

  public static getAllClients(): Map<string, BaseTelegramClient> {
    return new Map(this.instances);
  }

  public static async removeClient(id: string): Promise<boolean> {
    const client = this.instances.get(id);
    if (!client) return false;

    try {
      await client.disconnect();
      this.instances.delete(id);
      return true;
    } catch (error) {
      console.error(`Error removing client ${id}:`, error);
      return false;
    }
  }

  public static async reconnectClient(id: string): Promise<boolean> {
    const client = this.instances.get(id);
    if (!client) return false;

    try {
      await client.disconnect();
      await client.initialize();
      return true;
    } catch (error) {
      console.error(`Error reconnecting client ${id}:`, error);
      return false;
    }
  }
}