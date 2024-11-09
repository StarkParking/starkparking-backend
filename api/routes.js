import express from 'express'
import UserRouter from './routes/user.js'
import NotificationRouter from './routes/notification.js'

const router = express.Router()
router.use('/user', UserRouter);
router.use('/notification', NotificationRouter);

export default router
