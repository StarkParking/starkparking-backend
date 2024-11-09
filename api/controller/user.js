import { UserModel, BookingModel } from '../../models/db.js'
import logger from '../../helpers/logger.js'

export const saveUser = async (req, res) => {
  const { userId, username, walletAddress } = req.body

  if ((!userId, !username, !walletAddress)) {
    logger
      .debug('Missing required fields')
      .json({ result: false, message: 'Missing required fields' })
  }

  try {
    const user = await UserModel.findOne({ userId })

    if (user) {
      logger.debug('User already exists')
      return res
        .status(200)
        .json({ result: true, message: 'User already exists' })
    }

    const newUser = UserModel({
      userId,
      username,
      walletAddress
    })

    await newUser.save()

    res
      .status(200)
      .json({ result: true, message: 'User saved successfully' })
    logger.info(`User ${username} saved successfully`)
  } catch (error) {
    logger.error('Error saving user', error)
    res.status(500).json({ result: false, message: 'Error saving user' })
  }
}

export const addBookingToUser = async (req, res) => {
  const { userId, bookingId } = req.body;

  try {

    const user = await UserModel.findOne({ userId });

    if (!user) {
      return res.status(200).json({ result: true, message: 'User does not exist' });
    }

    if (user.bookingIds.includes(bookingId)) {
      return res.status(400).json({ result: false, message: 'Booking ID already exists' });
    }

    user.bookingIds.push(bookingId);

    await user.save();

    return res.status(200).json({ result: true, message: 'Booking ID added successfully', user });

  } catch (error) {
    console.error('Error adding booking ID:', error);
    return res.status(500).json({ result: false, message: 'Error adding booking ID' });
  }
};

export const getUserBookings = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await UserModel.findOne({ userId });

    if (!user) {
      return res.status(200).json({ result: true, message: 'User does not exist' });
    }

    if (user.bookingIds.length === 0) {
      return res.status(200).json({ result: true, message: 'No bookings found for this user' });
    }

    // Fetch the bookings by their IDs from the Booking collection
    const bookings = await BookingModel.find({ booking_id: { $in: user.bookingIds } });
    console.log('bookings', bookings);
    

    // Return the booking details
    return res.status(200).json({ result: true, message: 'Bookings fetched successfully', bookings });

  } catch (error) {
    console.error('Error retrieving user bookings:', error);
    return res.status(500).json({ result: false, message: 'Error retrieving bookings' });
  }
};
