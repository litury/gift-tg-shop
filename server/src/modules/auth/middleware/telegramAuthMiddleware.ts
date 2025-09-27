import { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'
import { LoggerService } from '../../core/services/loggerService'

const logger = new LoggerService()

export const telegramAuthMiddleware = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    logger.logInfo('Проверка аутентификации:', { 
      headers: Object.keys(req.headers),
      hasInitData: !!req.headers['telegram-web-app-init-data'],
      userAgent: req.headers['user-agent']
    })
    
    const initData = req.headers['telegram-web-app-init-data'] as string
    if (!initData) {
      logger.logWarning('Отсутствуют данные инициализации', {
        allHeaders: req.headers
      })
      res.status(401).json({ error: 'Отсутствуют данные инициализации' })
      return
    }

    // Парсим данные
    const urlParams = new URLSearchParams(initData)
    const hash = urlParams.get('hash')
    const userData = JSON.parse(decodeURIComponent(urlParams.get('user') || '{}'))

    // Добавляем пользователя в request
    req.user = userData

    // Проверяем подпись только в production
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.BOT_TOKEN) {
        logger.logError('BOT_TOKEN не установлен')
        res.status(500).json({ error: 'Ошибка конфигурации сервера' })
        return
      }

      const dataCheckString = Array.from(urlParams.entries())
        .filter(([key]) => key !== 'hash')
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n')

      const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(process.env.BOT_TOKEN)
        .digest()

      const generatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex')

      if (generatedHash !== hash) {
        logger.logWarning('Неверная подпись', { 
          expected: generatedHash,
          received: hash,
          dataCheckString 
        })
        res.status(401).json({ error: 'Неверная подпись' })
        return
      }
    }

    next()
  } catch (error) {
    logger.logError('Ошибка проверки авторизации:', error)
    res.status(401).json({ error: 'Ошибка проверки авторизации' })
  }
} 