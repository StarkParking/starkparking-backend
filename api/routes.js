import express from 'express'
import UserRouter from './routes/user.js'

const router = express.Router()
router.use('/user', UserRouter);

export default router
