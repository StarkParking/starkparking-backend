import express from 'express'
import { getAllParkingLots, getParkingLotById } from '../controller/parkingLot.js'

const router = express.Router()

router.get('/all', getAllParkingLots)
router.get('/:lotId', getParkingLotById)

export default router
