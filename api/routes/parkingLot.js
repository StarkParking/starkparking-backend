import express from 'express'
import { getAllParkingLots } from '../controller/parkingLot.js'

const router = express.Router()

router.get('/all', getAllParkingLots)

export default router
