import { Router, Request, Response, NextFunction, RequestHandler } from 'express'
import { GiftController } from '../controllers/giftController'
import { inlineAuthMiddleware } from '../../auth/middleware/inlineAuthMiddleware'
import { authMiddleware } from '../../auth/middleware/authMiddleware'
import { Gift } from '../../database/models/Gift'

const router = Router()
const controller = new GiftController()

const asyncHandler = (fn: (req: Request, res: Response) => Promise<void>): RequestHandler => {
  return async (req, res, next) => {
    try {
      await fn(req, res)
    } catch (error) {
      next(error)
    }
  }
}

router.get('/my', inlineAuthMiddleware, asyncHandler(async (req: Request, res: Response) => {
  await controller.getUserGiftsAsync(req, res)
}))

router.get('/', asyncHandler((req, res) => 
  controller.getGiftsAsync(req, res)
))

router.get('/:id/history', asyncHandler((req, res) => 
  controller.getGiftHistoryAsync(req, res)
))

router.get('/:id', inlineAuthMiddleware, asyncHandler(async (req: Request, res: Response) => {
  await controller.getByIdAsync(req, res)
}))

router.get('/:id/inline', async (req, res) => {
  try {
    const { id } = req.params
    const gift = await Gift.findById(id)
      .select('name description image')
      .lean()

    if (!gift) {
      return res.status(404).json({ error: 'Gift not found' })
    }

    res.json(gift)
  } catch (error) {
    console.error('Error getting gift for inline mode:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export { router as giftRoutes }
