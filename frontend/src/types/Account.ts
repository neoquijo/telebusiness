import { User } from "./User";

export interface Account {
  username: string;
  sessionData: string;
  id: string;
  accountId: string;
  user: User;
  phone: string;
  name: string;
  status: 'alive' | 'expired' | 'error'
}

interface UserProfilePhoto {
  flags: number;
  hasVideo: boolean;
  personal: boolean;
  photoId: string;
  strippedThumb: {
    type: string;
    data: number[];
  };
  dcId: number;
  className: string;
}

interface UserStatus {
  expires: number;
  className: string;
}

interface UserNotifySettings {
  flags: number;
  showPreviews: boolean;
  silent: boolean;
  muteUntil: number;
  iosSound: {
    className: string;
  };
  androidSound: {
    title: string;
    data: string;
    className: string;
  };
  otherSound: {
    title: string;
    data: string;
    className: string;
  };
  storiesMuted: any;
  storiesHideSender: any;
  storiesIosSound: any;
  storiesAndroidSound: any;
  storiesOtherSound: any;
  className: string;
}

interface PeerSettings {
  flags: number;
  reportSpam: boolean;
  addContact: boolean;
  blockContact: boolean;
  shareContact: boolean;
  needContactsException: boolean;
  reportGeo: boolean;
  autoarchived: boolean;
  inviteMembers: boolean;
  requestChatBroadcast: boolean;
  businessBotPaused: boolean;
  businessBotCanReply: boolean;
  geoDistance: any;
  requestChatTitle: any;
  requestChatDate: any;
  businessBotId: any;
  businessBotManageUrl: any;
  className: string;
}

interface UserFull {
  flags: number;
  blocked: boolean;
  phoneCallsAvailable: boolean;
  phoneCallsPrivate: boolean;
  canPinMessage: boolean;
  hasScheduled: boolean;
  videoCallsAvailable: boolean;
  voiceMessagesForbidden: boolean;
  translationsDisabled: boolean;
  storiesPinnedAvailable: boolean;
  blockedMyStoriesFrom: boolean;
  wallpaperOverridden: boolean;
  contactRequirePremium: boolean;
  readDatesPrivate: boolean;
  flags2: number;
  sponsoredEnabled: boolean;
  canViewRevenue: boolean;
  botCanManageEmojiStatus: boolean;
  id: string;
  about: any;
  settings: PeerSettings;
  personalPhoto: any;
  profilePhoto: UserProfilePhoto;
  fallbackPhoto: any;
  notifySettings: UserNotifySettings;
  botInfo: any;
  pinnedMsgId: any;
  commonChatsCount: number;
  folderId: any;
  ttlPeriod: any;
  themeEmoticon: any;
  privateForwardName: any;
  botGroupAdminRights: any;
  botBroadcastAdminRights: any;
  premiumGifts: any;
  wallpaper: any;
  stories: any;
  businessWorkHours: any;
  businessLocation: any;
  businessGreetingMessage: any;
  businessAwayMessage: any;
  businessIntro: any;
  birthday: any;
  personalChannelId: any;
  personalChannelMessage: any;
  stargiftsCount: any;
  starrefProgram: any;
  botVerification: any;
  className: string;
}

export interface AccountInfo {
  flags: number;
  self: boolean;
  contact: boolean;
  mutualContact: boolean;
  deleted: boolean;
  bot: boolean;
  botChatHistory: boolean;
  botNochats: boolean;
  verified: boolean;
  restricted: boolean;
  min: boolean;
  botInlineGeo: boolean;
  support: boolean;
  scam: boolean;
  applyMinPhoto: boolean;
  fake: boolean;
  botAttachMenu: boolean;
  premium: boolean;
  attachMenuEnabled: boolean;
  flags2: number;
  botCanEdit: boolean;
  closeFriend: boolean;
  storiesHidden: boolean;
  storiesUnavailable: boolean;
  contactRequirePremium: boolean;
  botBusiness: boolean;
  botHasMainApp: boolean;
  id: string;
  accessHash: string;
  firstName: string;
  lastName: any;
  username: string;
  phone: string;
  photo: UserProfilePhoto;
  status: UserStatus;
  botInfoVersion: any;
  restrictionReason: any;
  botInlinePlaceholder: any;
  langCode: any;
  emojiStatus: any;
  usernames: any;
  storiesMaxId: any;
  color: any;
  profileColor: any;
  botActiveUsers: any;
  botVerificationIcon: any;
  className: string;
}

export interface AccountData {
  accountInfo: AccountInfo;
  session: string;
  user: UserFull;
  avatar: string;
}

export interface VerifyAcount {
  code: string;
  phone: string;
  hash: string;
  password?: string;
}