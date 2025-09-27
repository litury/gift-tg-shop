import { Request, Response } from 'express'
import { TelegramService } from '../services/telegramService'
import type { ITelegramUpdate } from '../types/telegram'

export class WebhookController {
  private readonly p_telegramService: TelegramService

  constructor() {
    this.p_telegramService = new TelegramService()
  }

  public async handleUpdateAsync(req: Request, res: Response): Promise<void> {
    try {
      const update = req.body as ITelegramUpdate
      
      if (update.message?.text === '/start') {
        const chatId = update.message.chat?.id
        if (chatId) {
          await this.p_telegramService.sendMessage(chatId, {
            text: 'Добро пожаловать в Gift Shop Bot!'
          })
        }
      }
      
      res.sendStatus(200)
    } catch (error) {
      console.error('Ошибка обработки вебхука:', error)
      res.sendStatus(500)
    }
  }
}
