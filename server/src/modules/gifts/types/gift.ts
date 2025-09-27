import type { Types } from 'mongoose'
import type { CryptoAsset } from '../../payment/types/payment'

export interface IGift {
  _id?: Types.ObjectId
  id?: string
  name: string
  description: string
  image: string
  prices: {
    [key in CryptoAsset]: number
  }
  price?: number // legacy compatibility
  imageUrl?: string // legacy compatibility  
  category: string
  rarity: string
  isAvailable: boolean
  quantity?: number // legacy compatibility
  availableQuantity: number
  soldCount: number
  status: 'available' | 'purchased' | 'gifted'
  owner?: Types.ObjectId
  recipient?: Types.ObjectId
  bgColor: string
  createdAt: Date
  updatedAt: Date
}

export interface IGiftPurchase {
  giftId: string
  userId: string
}

export interface IGiftSend {
  giftId: string
  userId: string
  recipientId: string
} 