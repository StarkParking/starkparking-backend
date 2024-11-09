import { UserModel, BookingModel, ParkingLotModel } from '../../models/db.js'
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

    if (bookings.length === 0) {
      return res.status(200).json({ result: false, message: 'Bookings not found for this user' });
    }

    // Initialize an empty array to hold the bookings with parking lot details
    const bookingsWithLotDetails = [];

    // Loop through each booking and fetch corresponding parking lot details
    for (let booking of bookings) {
      const parkingLot = await ParkingLotModel.findOne({ lot_id: booking.lot_id });
      console.log('booking', booking);
      let booking2;
      if (parkingLot) {
        // Add the parking lot details to the booking object
        booking2 = {
          license_plate: booking.license_plate,
          booking_id: booking.booking_id,
          entry_time: booking.entry_time,
          exit_time: booking.exit_time,
          expiration_time: booking.expiration_time,
          total_payment: booking.total_payment,
          parking_lot: {
            lot_id: parkingLot.lot_id,
            name: parkingLot.name,
            location: parkingLot.location,
            coordinates: parkingLot.coordinates,
            slot_count: parkingLot.slot_count,
            hourly_rate_usd_cents: parkingLot.hourly_rate_usd_cents,
            wallet_address: parkingLot.wallet_address,
            is_active: parkingLot.is_active
          }
        };
      } else {
        booking.parkingLot = null; // If no parking lot found, set it to null
      }

      // Push the updated booking with parking lot details into the result array
      bookingsWithLotDetails.push(booking2);
    }

    console.log('bookingsWithLotDetails', bookingsWithLotDetails);

    // Return the list of bookings with parking lot details
    return res.status(200).json({
      result: true,
      message: 'Bookings fetched successfully',
      bookings: bookingsWithLotDetails
    });

  } catch (error) {
    console.error('Error retrieving user bookings:', error);
    return res.status(500).json({ result: false, message: 'Error retrieving bookings' });
  }
};
