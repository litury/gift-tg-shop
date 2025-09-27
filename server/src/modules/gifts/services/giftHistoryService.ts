import { GiftHistory, GiftHistoryAction } from '../../database/models/GiftHistory'
import { User } from '../../database/models/User'
import { LoggerService } from '../../core/services/loggerService'

interface IHistoryResponse {
  action: 'purchase' | 'send' | 'receive'
  timestamp: Date
  user: {
    id: number
    firstName: string
    lastName?: string
    username?: string
    avatar?: string // URL аватара пользователя
  }
  recipient?: {
    id: number
    firstName: string
    lastName?: string
    username?: string
    avatar?: string
  }
}

export class GiftHistoryService {
  private readonly p_logger: LoggerService

  constructor() {
    this.p_logger = new LoggerService()
  }

  public async getGiftHistoryAsync(giftId: string): Promise<IHistoryResponse[]> {
    try {
      const history = await GiftHistory.find({ giftId })
        .sort({ timestamp: -1 })
        .lean()

      // Получаем уникальные ID пользователей
      const userIds = [...new Set([
        ...history.map(h => h.userId),
        ...history.map(h => h.recipientId).filter(Boolean)
      ])]

      // Получаем информацию о пользователях
      const users = await User.find({ telegramId: { $in: userIds } })
        .select('telegramId firstName lastName username')
        .lean()

      const userMap = new Map(users.map(u => [u.telegramId, u]))

      return history.map(h => ({
        action: h.action,
        timestamp: h.timestamp,
        user: {
          id: h.userId,
          firstName: userMap.get(h.userId)?.firstName || 'Unknown',
          lastName: userMap.get(h.userId)?.lastName,
          username: userMap.get(h.userId)?.username,
          avatar: `https://api.telegram.org/bot${process.env.BOT_TOKEN}/getUserProfilePhotos?user_id=${h.userId}`
        },
        ...(h.recipientId && {
          recipient: {
            id: h.recipientId,
            firstName: userMap.get(h.recipientId)?.firstName || 'Unknown',
            lastName: userMap.get(h.recipientId)?.lastName,
            username: userMap.get(h.recipientId)?.username,
            avatar: `https://api.telegram.org/bot${process.env.BOT_TOKEN}/getUserProfilePhotos?user_id=${h.recipientId}`
          }
        })
      }))
    } catch (error) {
      this.p_logger.logError('Ошибка получения истории подарка:', error)
      throw error
    }
  }

  public async addPurchaseRecordAsync(giftId: string, userId: number): Promise<void> {
    try {
      await GiftHistory.create({
        giftId,
        userId,
        action: GiftHistoryAction.PURCHASE,
        timestamp: new Date()
      })
    } catch (error) {
      this.p_logger.logError('Ошибка добавления записи о покупке:', error)
      throw error
    }
  }

  public async addSendRecordAsync(giftId: string, userId: number, recipientId: number): Promise<void> {
    try {
      await GiftHistory.create({
        giftId,
        userId,
        recipientId,
        action: GiftHistoryAction.SEND,
        timestamp: new Date()
      })
    } catch (error) {
      this.p_logger.logError('Ошибка добавления записи об отправке:', error)
      throw error
    }
  }
} 