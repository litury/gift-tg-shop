import type { Telegram } from '@/types/telegram'

class TelegramService {
  private readonly p_webApp: Telegram.WebApp | undefined

  constructor() {
    this.p_webApp = window.Telegram?.WebApp
    if (!this.p_webApp) {
      console.warn('Telegram WebApp не инициализирован')
    }
  }

  public init(): void {
    if (this.p_webApp) {
      this.p_webApp.ready()
      this.p_webApp.expand()
    }
  }

  public showBackButton(): void {
    if (this.p_webApp?.BackButton) {
      this.p_webApp.BackButton.show()
    }
  }

  public hideBackButton(): void {
    if (this.p_webApp?.BackButton) {
      this.p_webApp.BackButton.hide()
    }
  }

  public onBackButtonClick(callback: () => void): void {
    if (this.p_webApp?.BackButton) {
      this.p_webApp.BackButton.onClick(callback)
    }
  }

  public offBackButtonClick(callback: () => void): void {
    if (this.p_webApp?.BackButton) {
      this.p_webApp.BackButton.offClick(callback)
    }
  }

  public async openInvoiceAsync(url: string): Promise<void> {
    if (!this.p_webApp) {
      throw new Error('Telegram WebApp не инициализирован')
    }

    try {
      if (!url) {
        throw new Error('URL инвойса не предоставлен')
      }
      
      const invoiceUrl = `${url}&mode=compact`
      await this.p_webApp.openTelegramLink(invoiceUrl)
    } catch (error) {
      console.error('Ошибка открытия инвойса:', error)
      throw error
    }
  }

  public openTelegramLink(url: string): void {
    if (!this.p_webApp) {
      throw new Error('Telegram WebApp не инициализирован')
    }

    try {
      if (!url) {
        throw new Error('URL не предоставлен')
      }
      
      
      this.p_webApp.openTelegramLink(url)
    } catch (error) {
      console.error('Ошибка открытия ссылки:', error)
      throw error
    }
  }

  public async sendGiftAsync(giftId: string): Promise<void> {
    if (!this.p_webApp) {
      throw new Error('Telegram WebApp не инициализирован')
    }

    try {
      this.p_webApp.switchInlineQuery(
        `gift_${giftId}`,
        ['users', 'groups']
      )
    } catch (error) {
      console.error('Ошибка отправки подарка:', error)
      throw error
    }
  }

  public getAuthHeaders(): Record<string, string> {
    return {
      'Telegram-Web-App-Init-Data': this.initData
    }
  }

  get webApp(): Telegram.WebApp | undefined {
    return this.p_webApp
  }

  get colorScheme(): 'light' | 'dark' {
    return this.p_webApp?.colorScheme || 'light'
  }

  get initData(): string {
    if (!this.p_webApp) {
      console.warn('Телеграм WebApp не инициализирован')
      return ''
    }
    const initData = this.p_webApp.initData || ''
    console.log('initData:', {
      hasWebApp: !!this.p_webApp,
      hasInitData: !!initData,
      initDataLength: initData.length,
      user: this.p_webApp.initDataUnsafe?.user,
      isExpanded: this.p_webApp.isExpanded
    })
    return initData
  }

  get user(): Telegram.WebAppUser | undefined {
    return this.p_webApp?.initDataUnsafe?.user
  }

  get viewportHeight(): number {
    return this.p_webApp?.viewportHeight || window.innerHeight
  }

  get isExpanded(): boolean {
    return this.p_webApp?.isExpanded || false
  }
}

export const telegramService = new TelegramService()