export interface IUserAvatar {
  url: string | null
  avatarUrl: string | null
}

export interface IUserResponse {
  avatarUrl: string
}

export interface IUserProfile {
  id?: number
  telegramId: number
  firstName: string
  lastName?: string
  username?: string
  languageCode?: string
  isPremium?: boolean
  giftsReceived: number
  giftsSent: number
  avatar?: string
  gifts?: any[]
}
