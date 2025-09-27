import { validate } from '@tma.js/init-data-node'
import jwt from 'jsonwebtoken'
import type { IAuthUser, IAuthResponse } from '../types/auth'
import { UserRepository } from '../../database/repositories/userRepository'
import type { IUser } from '../../database/types/user'

export class AuthService {
  private readonly p_jwtSecret: string
  private readonly p_botToken: string
  private readonly p_userRepository: UserRepository

  constructor() {
    const token = process.env.BOT_TOKEN
    if (!token) {
      throw new Error('BOT_TOKEN не задан')
    }
    this.p_botToken = token
    this.p_jwtSecret = process.env.JWT_SECRET || 'secret'
    this.p_userRepository = new UserRepository()
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

  public generateToken(_userId: number): string {
    return jwt.sign({ userId: _userId }, this.p_jwtSecret, { expiresIn: '24h' })
  }

  public parseUserData(_initData: string): IAuthUser | null {
    try {
      const userParam = _initData
        .split('&')
        .find((param) => param.startsWith('user='))
      
      if (!userParam) return null

      const userData = JSON.parse(
        decodeURIComponent(userParam.split('=')[1])
      )

      return userData
    } catch (error) {
      console.error('Ошибка парсинга данных пользователя:', error)
      return null
    }
  }

  public async authenticateUserAsync(_initData: string): Promise<IAuthResponse> {
    const userData = this.parseUserData(_initData)
    if (!userData) {
      throw new Error('Не удалось получить данные пользователя')
    }

    // Проверяем существует ли пользователь
    let user = await this.p_userRepository.findByTelegramIdAsync(userData.id)

    if (!user) {
      // Создаем нового пользователя
      user = await this.p_userRepository.createAsync({
        telegramId: userData.id,
        firstName: userData.first_name,
        lastName: userData.last_name,
        username: userData.username,
        languageCode: userData.language_code
      })
    } else {
      // Обновляем время последней активности
      const updatedUser = await this.p_userRepository.updateAsync(userData.id, {
        lastActive: new Date()
      })
      
      if (!updatedUser) {
        throw new Error('Не удалось обновить данные пользователя')
      }
      
      user = updatedUser
    }

    // Здесь user гарантированно не null
    return {
      token: this.generateToken(user.telegramId),
      user: this.mapUserToAuthUser(user)
    }
  }

  private mapUserToAuthUser(_user: IUser): IAuthUser {
    return {
      id: _user.telegramId,
      first_name: _user.firstName,
      last_name: _user.lastName,
      username: _user.username,
      language_code: _user.languageCode
    }
  }
}
