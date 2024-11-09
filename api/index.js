import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import api from './routes.js'
import logger from '../helpers/logger.js'
import { connectDB } from "../models/db.js";

import * as dotenv from 'dotenv'
dotenv.config()

const app = express()
const port = process.env.API_PORT || 3334

app.use(cors())
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }))

const initDB = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit the process if DB connection fails
  }
};

// Initialize MongoDB connection
initDB();

app.use((req, res, next) => {
  logger.debug(`Incoming request: ${req.method} ${req.url}`)
  next()
})

app.use('/', api)

app.listen(port, () => {
  logger.debug(`Server is running on http://localhost:${port}`)
})
