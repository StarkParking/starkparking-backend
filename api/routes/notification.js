import express from 'express'
import { sendNotificationNewBooking, sendNotificationEndBooking } from '../controller/notification.js'

const router = express.Router()

router.post('/addBooking', sendNotificationNewBooking)
router.post('/endBooking', sendNotificationEndBooking)

export default router
