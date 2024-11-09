import express from 'express'
import { sendNotificationNewBooking, sendNotificationEndBooking, sendNotificationExtendBooking } from '../controller/notification.js'

const router = express.Router()

router.post('/addBooking', sendNotificationNewBooking)
router.post('/endBooking', sendNotificationEndBooking)
router.post('/extendBooking', sendNotificationExtendBooking)

export default router
