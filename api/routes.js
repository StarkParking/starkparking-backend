import express from 'express'
import UserRouter from './routes/user.js'
import NotificationRouter from './routes/notification.js'
import ParkingLotRouter from './routes/parkingLot.js'

const router = express.Router()
router.use('/user', UserRouter);
router.use('/notification', NotificationRouter);
router.use('/parkingLot', ParkingLotRouter);

export default router
