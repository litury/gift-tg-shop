import { Schema, model } from 'mongoose'
import type { IGift } from '../../../modules/gifts/types/gift'

const giftSchema = new Schema<IGift>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  prices: {
    USDT: { type: Number, required: true },
    TON: { type: Number, required: true },
    BTC: { type: Number, required: true },
    ETH: { type: Number, required: true }
  },
  isAvailable: { type: Boolean, default: true },
  availableQuantity: { type: Number, required: true },
  soldCount: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['available', 'purchased', 'gifted'],
    default: 'available'
  },
  rarity: { type: String, required: true },
  category: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  recipient: { type: Schema.Types.ObjectId, ref: 'User' },
  bgColor: { type: String, required: true }
}, {
  timestamps: true
})

export const Gift = model<IGift>('Gift', giftSchema)
export type { IGift }
