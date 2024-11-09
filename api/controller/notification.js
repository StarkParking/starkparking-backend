import TelegramBot from 'node-telegram-bot-api';
import { BookingModel, ParkingLotModel, UserModel } from '../../models/db.js'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_TOKEN || '';

// Initialize the Telegram bot
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Function to send a notification via Telegram
const sendTelegramNotification = async (userId, message) => {
  try {
    await bot.sendMessage(userId, message);
    console.log('Telegram notification sent');
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
  }
};

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`;
  return formattedDate;
}

function formatTimestampToLocaleString(timeString) {
  const date = new Date(timeString);

  // Use toLocaleString to format the date
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  return date.toLocaleString('en-GB', options);
}


export const sendNotificationNewBooking = async (req, res) => {
  const { userId, lotId, licensePlate, entryTime, duration } = req.body;

  try {
    const parkingLot = await ParkingLotModel.findOne({ lot_id: lotId });
    const user = await UserModel.findOne({ userId: userId });

    if (!parkingLot) {
      return res.status(404).json({ result: false, message: 'Parking lot not found' });
    }

    const message = `
🚘 New Booking Created!
==================================
🎯 Parking Lot: ${parkingLot.name}
📍 Address: ${parkingLot.location}
🪪 License Plate: ${licensePlate}
🕐 Entry Time: ${formatTimestamp(Number(entryTime) * 1000)}
🔴 Expiration Time: ${formatTimestamp(Number(entryTime) * 1000 + (duration * 60 * 60 * 1000))}
💰 Total Payment: $${(Number(duration) * parkingLot.hourly_rate_usd_cents) / 100}`;

    // Send the Telegram notification
    await sendTelegramNotification(user.userId, message);

    return res.status(200).json({ result: true, message: 'Booking notification sent' });

  } catch (error) {
    console.error('Error sending booking notification:', error);
    return res.status(500).json({ result: false, message: 'Error sending notification' });
  }
}

export const sendNotificationEndBooking = async (req, res) => {
  const { userId, bookingId, exitTime } = req.body;

  try {
    const user = await UserModel.findOne({ userId: userId });
    const booking = await BookingModel.findOne({ booking_id: bookingId });
    if (!user) {
      return res.status(404).json({ result: false, message: 'User not found' });
    }
    if (!booking) {
      return res.status(404).json({ result: false, message: 'Booking not found' });
    }

    const parkingLot = await ParkingLotModel.findOne({ lot_id: booking.lot_id });
    console.log('user', user);
    console.log('booking', booking);
    if (!parkingLot) {
      return res.status(404).json({ result: false, message: 'Parking lot not found' });
    }

    const message = `
🚘 Your parking session has ended!
==================================
🎯 Parking Lot: ${parkingLot.name}
📍 License Plate: ${parkingLot.location}
🪪 Entry Time: ${formatTimestampToLocaleString(booking.entry_time)}
🔴 Exit Time: ${formatTimestamp(Number(exitTime) * 1000)}
💰 Total Payment: $${booking.total_payment / 100}
Thank you for using our service!
`;
    // Send the Telegram notification
    await sendTelegramNotification(user.userId, message);

    return res.status(200).json({ result: true, message: 'End booking notification sent' });

  } catch (error) {
    console.error('Error sending booking notification:', error);
    return res.status(500).json({ result: false, message: 'Error sending notification' });
  }
}