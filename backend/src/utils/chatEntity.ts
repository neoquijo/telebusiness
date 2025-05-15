import { Api, TelegramClient } from "telegram";
import { Dialog } from "telegram/tl/custom/dialog";

type TypeChat = Api.Chat | Api.Channel | Api.ChatEmpty | Api.ChatForbidden | Api.ChannelForbidden;
type TypeUser = Api.User | Api.UserEmpty;

export function getTypedEntity(dialog: Dialog): TypeUser | TypeChat {
  const { entity } = dialog;

  if (!entity) throw new Error("Dialog has no entity");
  if (entity.className === 'User' || entity.className === 'UserEmpty') {
    return entity as TypeUser;
  }

  if ([
    'Chat',
    'Channel',
    'ChatEmpty',
    'ChatForbidden',
    'ChannelForbidden'
  ].includes(entity.className)) {
    return entity as TypeChat;
  }

  throw new Error(`Unsupported entity type: ${entity.className}`);
}

export function getEntityType(dialog: Dialog): "user" | "chat" | "channel" {
  const entity = getTypedEntity(dialog);

  if (entity.className === 'User' || entity.className === 'UserEmpty') {
    return "user";
  }

  if (entity.className === 'Channel') {
    return (entity as Api.Channel).megagroup ? "chat" : "channel";
  }

  if ([
    'Chat',
    'ChatEmpty',
    'ChatForbidden',
    'ChannelForbidden'
  ].includes(entity.className)) {
    return "chat";
  }

  throw new Error(`Unknown entity type: ${entity.className}`);
}

export type NormalizedDialog = {
  id: number;
  title: string;
  broadcast: boolean;
  description?: string;
  unreadCount: number;
  unreadMentionsCount: number;
  participantsCount?: number;
  isBot: boolean;
  canSendMessages?: boolean;
  type: string;
};

function isUser(entity: any): entity is Api.User {
  return entity?.className === 'User';
}

function isUserEmpty(entity: any): entity is Api.UserEmpty {
  return entity?.className === 'UserEmpty';
}

function isChannel(entity: any): entity is Api.Channel {
  return entity?.className === 'Channel';
}

function isChat(entity: any): entity is Api.Chat {
  return entity?.className === 'Chat';
}

function isChatEmpty(entity: any): entity is Api.ChatEmpty {
  return entity?.className === 'ChatEmpty';
}

function isChatForbidden(entity: any): entity is Api.ChatForbidden {
  return entity?.className === 'ChatForbidden';
}

function isChannelForbidden(entity: any): entity is Api.ChannelForbidden {
  return entity?.className === 'ChannelForbidden';
}

export async function normalizeDialog(
  client: any,
  dialog: Dialog
): Promise<NormalizedDialog | null> {
  const { entity } = dialog;
  if (!entity) return null;

  const common = {
    id: (entity as any).id,
    unreadCount: dialog.unreadCount || 0,
    unreadMentionsCount: dialog.unreadMentionsCount || 0,
  };

  let title = '';
  let description = '';
  let participantsCount: number | undefined;
  let canSendMessages = true;
  let isBot = false;
  let broadcast = false;

  if (isUser(entity)) {
    title = `@${entity.username || entity.phone} ${entity.firstName || ''} ${entity.lastName || ''}`.trim();
    description = entity.username || '';
    isBot = entity.bot;
  }

  if (isUserEmpty(entity)) {
    title = 'Deleted User';
    description = 'User was deleted';
  }

  if (isChat(entity) || isChatForbidden(entity)) {
    title = entity.title;
  }

  if (isChatEmpty(entity)) {
    title = 'Empty Chat';
  }

  if (isChannel(entity)) {
    title = entity.title;
    description = entity.username || '';
    participantsCount = entity.participantsCount;
    canSendMessages = !entity.broadcast;
    broadcast = entity.broadcast;
  }

  if (isChannelForbidden(entity)) {
    title = entity.title;
  }

  return {
    ...common,
    title,
    description,
    participantsCount,
    canSendMessages,
    isBot,
    broadcast,
    type: entity.className
  };
}