import { NormalizedDialog } from "src/utils/chatEntity";

export interface ChatImports {
  chats: NormalizedDialog[]
  makePublic: boolean;
  collectionName?: string;
}