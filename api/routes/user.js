import express from 'express'
import { saveUser } from '../controller/user.js'

const router = express.Router()

router.post('/save', saveUser)

export default router
