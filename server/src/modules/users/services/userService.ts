import { TelegramService } from './telegramService'
import { LoggerService } from '../../core/services/loggerService'
import type { IUserAvatar, IUserResponse } from '../types/user'
import type { IUserProfile } from '../types/user'
import { User } from '../../database/models'
import { UserGift } from '../../database/models'
import type { IUserGift } from '../../gifts/types/userGift'

export class UserService {
  private readonly p_telegramService: TelegramService
  private readonly p_logger: LoggerService

  constructor() {
    this.p_telegramService = new TelegramService()
    this.p_logger = new LoggerService()
  }

  private isAvatarOutdated(lastUpdated?: Date): boolean {
    if (!lastUpdated) return true
    
    const now = new Date().getTime()
    const lastUpdate = new Date(lastUpdated).getTime()
    const dayInMs = 24 * 60 * 60 * 1000
    
    return now - lastUpdate > dayInMs
  }

  public async getUserAvatarAsync(_userId: number): Promise<string | null> {
    try {
      const user = await User.findOne({ telegramId: _userId })
      if (!user) {
        return null
      }

      if (user.avatar?.url && !this.isAvatarOutdated(user.avatar.lastUpdated)) {
        return user.avatar.url
      }

      const avatarUrl = await this.p_telegramService.getUserAvatarUrlAsync(_userId)
      
      if (avatarUrl) {
        await User.updateOne(
          { telegramId: _userId },
          { 
            $set: {
              'avatar.url': avatarUrl,
              'avatar.lastUpdated': new Date()
            }
          }
        )
        return avatarUrl
      }

      return null
    } catch (error) {
      this.p_logger.logError('Ошибка получения аватара:', error)
      return null
    }
  }

  public async getUserProfileAsync(_userId: number): Promise<IUserResponse> {
    try {
      const avatarUrl = await this.p_telegramService.getUserAvatarUrlAsync(_userId)
      return {
        avatarUrl: avatarUrl || ''
      }
    } catch (error) {
      this.p_logger.logError('Ошибка получения профиля:', error)
      return {
        avatarUrl: ''
      }
    }
  }

  public async getOrUpdateAvatarAsync(_userId: number): Promise<string | null> {
    try {
      const user = await User.findOne({ telegramId: _userId })
      if (!user) return null

      // Если аватарка есть и на обновлялась менее суток назад - возвращаем её
      if (user.avatar?.url && user.avatar.lastUpdated) {
        const lastUpdate = new Date(user.avatar.lastUpdated).getTime()
        const now = new Date().getTime()
        const dayInMs = 24 * 60 * 60 * 1000

        if (now - lastUpdate < dayInMs) {
          return user.avatar.url
        }
      }

      // Иначе запрашиваем новую
      return await this.p_telegramService.getUserAvatarUrlAsync(_userId)
    } catch (error) {
      this.p_logger.logError('Ошибка получения/обновления аватара:', error)
      return null
    }
  }

  public async getUserProfileWithGiftsAsync(_userId: number): Promise<{
    profile: IUserProfile,
    gifts: any[]
  }> {
    try {
      // Получаем профиль пользователя
      const user = await User.findOne({ telegramId: _userId })
      if (!user) {
        throw new Error('Пользователь не найден')
      }

      // Получаем подарки пользователя с полной информацией
      const gifts = await UserGift.find({ userId: _userId })
        .populate('giftId')
        .sort({ purchaseDate: -1 })
        .lean()

      this.p_logger.logInfo('Получены данные профиля:', { 
        userId: _userId, 
        giftsCount: gifts.length 
      })

      return {
        profile: {
          id: user.telegramId,
          telegramId: user.telegramId,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          isPremium: user.isPremium,
          giftsReceived: user.giftsReceived,
          giftsSent: user.giftsSent,
          avatar: user.avatar?.url,
          languageCode: user.languageCode,
          gifts: gifts.map(gift => ({
            ...gift,
            _id: gift._id.toString(),
            gift: {
              ...gift.giftId,
              _id: (gift.giftId as any)._id.toString()
            }
          }))
        },
        gifts: gifts.map(gift => ({
          ...gift,
          _id: gift._id.toString(),
          gift: {
            ...gift.giftId,
            _id: (gift.giftId as any)._id.toString()
          }
        }))
      }
    } catch (error) {
      this.p_logger.logError('Ошибка получения профиля с подарками:', error)
      throw error
    }
  }

  public async getUserGiftsHistoryAsync(_userId: number): Promise<any[]> {
    try {
      const gifts = await UserGift.find({
        $or: [
          { userId: _userId },
          { recipientId: _userId }
        ]
      })
      .populate({
        path: 'giftId',
        model: 'Gift',
        select: 'name description image prices isAvailable availableQuantity soldCount status rarity category bgColor'
      })
      .sort({ purchaseDate: -1 })
      .lean()

      // Преобразуем данные в нужный формат
      return gifts.map(gift => ({
        ...gift,
        _id: gift._id.toString(),
        gift: {
          ...gift.giftId,
          _id: (gift.giftId as any)._id.toString()
        }
      }))
    } catch (error) {
      this.p_logger.logError('Ошибка получения истории подарков:', error)
      throw error
    }
  }

  public async getPurchasedGiftsAsync(userId: number): Promise<any[]> {
    try {
      const userGifts = await UserGift.find({
        userId,
        status: 'purchased'
      }).populate('giftId')
      
      this.p_logger.logInfo('Получены купленные подарки:', { 
        userId, 
        count: userGifts.length 
      })

      // Добавляем проверку на null/undefined
      return userGifts
        .filter(ug => ug.giftId) // Фильтруем записи с отсутствующими подарками
        .map(userGift => ({
          _id: (userGift.giftId as any)._id,
          name: (userGift.giftId as any).name,
          description: (userGift.giftId as any).description,
          image: (userGift.giftId as any).image,
          purchaseDate: userGift.purchaseDate,
          status: userGift.status
        }))
    } catch (error) {
      this.p_logger.logError('Ошибка получения купленных подарков:', error)
      throw error
    }
  }
}
