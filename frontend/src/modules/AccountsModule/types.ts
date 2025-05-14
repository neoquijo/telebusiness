export type NormalizedDialog = {
  username?: string;
  id: number;
  title: string;
  description?: string;
  unreadCount: number;
  unreadMentionsCount: number;
  participantsCount?: number;
  isBot?: boolean;
  // avatar?: Buffer;
  canSendMessages: boolean;
  type: string
};

export type FilterType = 'private' | 'bot' | 'channel' | 'chat' | 'selected' | null;