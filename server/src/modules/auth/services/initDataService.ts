import { validate, sign, isValid } from '@tma.js/init-data-node'
import type { IInitDataPayload } from '../types/auth'

export class InitDataService {
  private readonly p_botToken: string

  constructor() {
    const token = process.env.BOT_TOKEN
    if (!token) {
      throw new Error('Не задан BOT_TOKEN')
    }
    this.p_botToken = token
  }

  public async validateInitDataAsync(_initData: string): Promise<boolean> {
    try {
      validate(_initData, this.p_botToken)
      return true
    } catch (error) {
      console.error('Неверные данные инициализации:', error)
      return false
    }
  }

  public isValidInitData(_initData: string): boolean {
    return isValid(_initData, this.p_botToken)
  }

  public async createInitDataAsync(_payload: IInitDataPayload): Promise<string> {
    const signData = {
      user: _payload.user ? {
        id: _payload.user.id,
        first_name: _payload.user.first_name,
        last_name: _payload.user.last_name,
        username: _payload.user.username,
        language_code: _payload.user.language_code
      } : undefined,
      chat_instance: _payload.chat_instance,
      start_param: _payload.start_param
    }

    return sign(signData, this.p_botToken, new Date())
  }
}
