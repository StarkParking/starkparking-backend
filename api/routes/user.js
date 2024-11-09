import express from 'express'
import { saveUser, addBookingToUser, getUserBookings } from '../controller/user.js'
import * as dotenv from 'dotenv'
dotenv.config()

const router = express.Router()

router.post('/save', saveUser)
router.post('/addBooking', addBookingToUser )
router.get('/:userId/bookings', getUserBookings )

export default router
