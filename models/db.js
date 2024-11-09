import mongoose from 'mongoose'

// Define the schema for tokens
const tokenSchema = new mongoose.Schema({
  address: { type: String, required: true },
  decimals: { type: Number, required: true }
})

// Create a model for Token
const TokenModel = mongoose.model('Token', tokenSchema)

// Define the schema for parking lots
const parkingLotSchema = new mongoose.Schema({
  lot_id: { type: Number, unique: true, required: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  coordinates: { type: String, required: true }, // [longitude, latitude]
  slot_count: { type: Number, required: true },
  hourly_rate_usd_cents: { type: Number, required: true },
  creator: { type: String, required: true }, // Address of the creator
  wallet_address: { type: String, required: true },
  is_active: { type: Boolean, default: true },
  registration_time: { type: Date, default: Date.now }
})

// Create a model for ParkingLot
const ParkingLotModel = mongoose.model('ParkingLot', parkingLotSchema)

// Define the schema for bookings
const bookingSchema = new mongoose.Schema({
  license_plate: { type: String, required: true },
  booking_id: { type: String, unique: true, required: true },
  lot_id: { type: Number, required: true },
  entry_time: { type: Date, required: true },
  exit_time: { type: Date },
  expiration_time: { type: Date },
  total_payment: { type: Number, required: true },
  payer: { type: String }
})

// Create a model for Booking
const BookingModel = mongoose.model('Booking', bookingSchema)

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  walletAddress: { type: String, required: true },
  booking_ids: [{ type: String }]
})

const UserModel = mongoose.model('User', userSchema)

// Connect to MongoDB
const connectDB = async () => {
  try {
    const dbURI = 'mongodb://127.0.0.1:27017/StarkParking'
    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log('MongoDB connected')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1) // Exit the process if DB connection fails
  }
}

// Export the models and connection function
export { connectDB, TokenModel, ParkingLotModel, BookingModel, UserModel }
