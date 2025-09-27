import CryptoBotAPI from 'crypto-bot-api'
import { config } from '../../../config'
import { LoggerService } from '../../core/services/loggerService'
import { CryptoAsset } from '../types/payment'

interface CreateInvoiceParams {
  amount: string;
  asset: string;
  description?: string;
  hidden_message?: string;
  payload: string;
  paid_btn_name?: 'viewItem' | 'openChannel' | 'openBot' | 'callback';
  paid_btn_url?: string;
}

class CryptoPayService {
  private readonly p_client: CryptoBotAPI
  private readonly p_logger: LoggerService

  constructor() {
    this.p_logger = new LoggerService()
    
    try {
      if (!config.CRYPTO_PAY_API_TOKEN) {
        throw new Error('CRYPTO_PAY_API_TOKEN не задан в конфигурации')
      }
      
      const isTestnet = config.CRYPTO_PAY_API_TOKEN.startsWith('20028:')
      
      this.p_logger.logInfo('Инициализация CryptoPay с токеном:', {
        tokenPreview: `${config.CRYPTO_PAY_API_TOKEN.substring(0, 5)}...${config.CRYPTO_PAY_API_TOKEN.slice(-5)}`,
        environment: isTestnet ? 'testnet' : 'mainnet'
      })
      
      this.p_client = new CryptoBotAPI(
        config.CRYPTO_PAY_API_TOKEN,
        isTestnet ? 'testnet' : 'mainnet'
      )
    } catch (error) {
      this.p_logger.logError('Ошибка инициализации CryptoPay клиента:', error)
      throw error
    }
  }

  public async createInvoiceAsync(params: CreateInvoiceParams) {
    try {
      this.p_logger.logInfo('Создание инвойса:', params)
      
      const invoiceParams = {
        amount: params.amount,
        asset: params.asset,
        description: params.description,
        payload: params.payload,
        paid_btn_name: params.paid_btn_name,
        paid_btn_url: params.paid_btn_url,
        allow_comments: false,
        allow_anonymous: false,
        expires_in: 1800,
        hidden_message: params.hidden_message
      }

      this.p_logger.logInfo('Параметры инвойса:', invoiceParams)
      
      const invoice = await this.p_client.createInvoice(invoiceParams)
      
      if (!invoice) {
        throw new Error('Пустой ответ от Crypto Pay API')
      }

      return {
        invoice_id: invoice.id,
        status: invoice.status,
        result: {
          mini_app_invoice_url: invoice.miniAppPayUrl
        }
      }
    } catch (error: any) {
      this.p_logger.logError('Ошибка создания инвойса:', {
        error: error.message,
        stack: error.stack,
        response: error.response?.data,
        token: config.CRYPTO_PAY_API_TOKEN ? '***' : 'не задан'
      })
      throw error
    }
  }

  public async getInvoiceAsync(invoiceId: number) {
    try {
      const response = await this.p_client.getInvoices({ 
        invoice_ids: [invoiceId] 
      })
      return response.items[0]
    } catch (error) {
      this.p_logger.logError('Ошибка получения инвойса:', error)
      throw error
    }
  }
}

export const cryptoPayService = new CryptoPayService()
