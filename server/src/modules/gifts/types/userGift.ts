import type { Types } from 'mongoose'
import type { IGift } from './gift'

export interface IUserGift {
  _id?: Types.ObjectId
  userId: Types.ObjectId
  giftId: Types.ObjectId | IGift
  status: 'owned' | 'gifted' | 'received'
  receivedFrom?: Types.ObjectId
  giftedTo?: Types.ObjectId
  purchaseDate?: Date
  giftDate?: Date
  receiveDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface IUserGiftPopulated extends Omit<IUserGift, 'giftId'> {
  giftId: IGift
}