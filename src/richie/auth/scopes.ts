export enum TwitchScope {
  /* View analytics data for the Twitch Extensions owned by the authenticated account. */
  AnalyticsReadExtensions = "analytics:read:extensions",

  /* View analytics data for the games owned by the authenticated account. */
  AnalyticsReadGames = "analytics:read:games",

  /* View Bits information for a channel. */
  BitsRead = "bits:read",

  /* Run commercials on a channel. */
  ChannelEditCommercial = "channel:edit:commercial",

  /* Manage a channel’s broadcast configuration, including updating channel configuration and managing stream markers and stream tags. */
  ChannelManageBroadcast = "channel:manage:broadcast",

  /* Manage a channel’s Extension configuration, including activating Extensions. */
  ChannelManageExtensions = "channel:manage:extensions",

  /* Manage Channel Points custom rewards and their redemptions on a channel. */
  ChannelManageRedemptions = "channel:manage:redemptions",

  /* Manage a channel’s videos, including deleting videos. */
  ChannelManageVideos = "channel:manage:videos",

  /* Perform moderation actions in a channel. The user requesting the scope must be a moderator in the channel. */
  ChannelModerate = "channel:moderate",

  /* View a list of users with the editor role for a channel. */
  ChannelReadEditors = "channel:read:editors",

  /* View Hype Train information for a channel. */
  ChannelReadHypeTrain = "channel:read:hype_train",

  /* View Channel Points custom rewards and their redemptions on a channel. */
  ChannelReadRedemptions = "channel:read:redemptions",

  /* View an authorized user’s stream key. */
  ChannelReadStreamKey = "channel:read:stream_key",

  /* View a list of all subscribers to a channel and check if a user is subscribed to a channel. */
  ChannelReadSubscriptions = "channel:read:subscriptions",

  /* Send live stream chat and rooms messages. */
  ChatEdit = "chat:edit",

  /* View live stream chat and rooms messages. */
  ChatRead = "chat:read",

  /* Manage Clips for a channel. */
  ClipsEdit = "clips:edit",

  /* View a channel’s moderation data including Moderators, Bans, Timeouts, and Automod settings. */
  ModerationRead = "moderation:read",

  /* Manage a user object. */
  UserEdit = "user:edit",

  /* Edit your channel's broadcast configuration, including extension configuration. (This scope implies user:read:broadcast capability.) */
  UserEditBroadcast = "user:edit:broadcast",

  /* Edit a user’s follows. */
  UserEditFollows = "user:edit:follows",

  /* Manage the block list of a user. */
  UserManageBlockedUsers = "user:manage:blocked_users",

  /* View the block list of a user. */
  UserReadBlockedUsers = "user:read:blocked_users",

  /* View a user’s broadcasting configuration, including Extension configurations. */
  UserReadBroadcast = "user:read:broadcast",

  /* View the list of channels a user follows. */
  UserReadFollows = "user:read:follows",

  /* Read an authorized user’s email address. */
  UserReadEmail = "user:read:email",

  /* View if an authorized user is subscribed to specific channels. */
  UserReadSubscriptions = "user:read:subscriptions",

  /* Send whisper messages. */
  WhispersEdit = "whispers:edit",

  /* View your whisper messages. */
  WhispersRead = "whispers:read"
}

export function getAllScopes(): Array<TwitchScope> {
  return [
    TwitchScope.ChannelModerate,
    TwitchScope.ChatEdit,
    TwitchScope.ChatRead,
    TwitchScope.WhispersEdit,
    TwitchScope.WhispersRead
  ];
}
