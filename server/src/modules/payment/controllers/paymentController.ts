import { Request, Response } from 'express'
import { LoggerService } from '../../core/services/loggerService'
import { TelegramService } from '../../telegram/services/telegramService'
import { GiftService } from '../../gifts/services/giftService'
import { cryptoPayService } from '../services/cryptoPayService'
import crypto from 'crypto'

export class PaymentController {
  private readonly p_logger: LoggerService
  private readonly p_telegramService: TelegramService
  private readonly p_giftService: GiftService

  constructor() {
    this.p_logger = new LoggerService()
    this.p_telegramService = new TelegramService()
    this.p_giftService = new GiftService()
  }

  private validateWebhookSignature(body: any, signature: string): boolean {
    const token = process.env.CRYPTO_PAY_API_TOKEN
    const data = JSON.stringify(body)
    const hmac = crypto.createHmac('sha256', token)
    const calculatedSignature = hmac.update(data).digest('hex')
    return calculatedSignature === signature
  }

  public async createPaymentAsync(req: Request, res: Response) {
    try {
      const { amount, giftId, giftName, asset, description } = req.body
      const userId = req.user?.id

      if (!userId) {
        this.p_logger.logWarning('Попытка создать платеж без авторизации')
        return res.status(401).json({ error: 'Пользователь не авторизован' })
      }
      
      // Проверяем доступность подарка
      const gift = await this.p_giftService.getByIdAsync(giftId)
      if (!gift || !gift.isAvailable || gift.availableQuantity <= 0) {
        this.p_logger.logWarning('Попытка купить недоступный подарок', { giftId })
        return res.status(400).json({ error: 'Подарок недоступен для покупки' })
      }

      // Проверяем корректность суммы
      if (gift.prices[asset] !== amount) {
        this.p_logger.logWarning('Некорректная сумма платежа', { 
          expected: gift.prices[asset],
          received: amount 
        })
        return res.status(400).json({ error: 'Некорректная сумма для выбранной валюты' })
      }

      // Создаем инвойс через Crypto Pay
      const invoice = await cryptoPayService.createInvoiceAsync({
        amount: amount.toString(),
        asset,
        description: `Покупка подарка: ${giftName}`,
        hidden_message: `Спасибо за покупку ${giftName}!`,
        payload: JSON.stringify({ giftId, userId }),
        paid_btn_name: 'viewItem',
        paid_btn_url: `${process.env.WEBAPP_URL}/gifts/${giftId}`
      })

      this.p_logger.logInfo('Создан инвойс для покупки подарка', { 
        userId,
        giftId,
        invoiceId: invoice.invoice_id
      })

      // Возвращаем успешный ответ с инвойсом
      res.json({
        success: true,
        data: {
          invoice_id: invoice.invoice_id,
          pay_url: invoice.result.mini_app_invoice_url
        }
      })
    } catch (error) {
      this.p_logger.logError('Ошибка создания платежа:', error)
      res.status(500).json({ 
        success: false, 
        error: 'Ошибка создания платежа' 
      })
    }
  }

  public async checkPaymentAsync(req: Request, res: Response) {
    try {
      const { invoiceId } = req.params
      
      if (!invoiceId) {
        return res.status(400).json({ error: 'Invoice ID is required' })
      }

      // Здесь можно добавить логику проверки статуса платежа
      // через Crypto Pay API или базу данных
      
      res.json({
        success: true,
        status: 'checking'
      })
    } catch (error) {
      this.p_logger.logError('Ошибка проверки платежа:', error)
      res.status(500).json({ error: 'Ошибка проверки платежа' })
    }
  }

  public async handleWebhookAsync(req: Request, res: Response) {
    try {
      const signature = req.headers['crypto-pay-api-signature'] as string
      
      if (!signature) {
        return res.status(400).json({ error: 'Missing signature' })
      }

      if (!this.validateWebhookSignature(req.body, signature)) {
        return res.status(401).json({ error: 'Invalid signature' })
      }

      // Обработка webhook данных
      this.p_logger.logInfo('Получен webhook от Crypto Pay', req.body)
      
      res.json({ success: true })
    } catch (error) {
      this.p_logger.logError('Ошибка обработки webhook:', error)
      res.status(500).json({ error: 'Ошибка обработки webhook' })
    }
  }
}
