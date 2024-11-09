import { RpcProvider, events, CallData, Contract } from "starknet";
import { connectDB, ParkingLotModel, BookingModel } from "./models/db.js";
import config from "config";
import { toHex, parseBNToStr } from "./helpers/utils.js"

const CONTRACT_ADDRESS = config.get('contractAddress');
const REGISTERED = config.get('events.ParkingLotRegistered');
const BOOKED = config.get('events.ParkingBooked');
const EXTENDED = config.get('events.ParkingExtended');
const ENDED = config.get('events.ParkingEnded');
const PENALTY_IMPOSED = config.get('events.PenaltyImposed');
const PAYMENT_TOKEN_ADDED = config.get('events.PaymentTokenAdded');
const RPC = config.get('rpcURL');

// Connect to MongoDB
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

/**
 * Function to poll the latest block and listen for events from the contract
 */
const main = async () => {
  const myProvider = new RpcProvider({ nodeUrl: RPC });
  const sierra = await myProvider.getClassAt(CONTRACT_ADDRESS);
  const abiEvents = events.getAbiEvents(sierra.abi);
  const abiStructs = CallData.getAbiStruct(sierra.abi);
  const abiEnums = CallData.getAbiEnum(sierra.abi);

  const starkParking = new Contract(sierra.abi, CONTRACT_ADDRESS, myProvider);

  try {
    // Get the latest block
    const latestBlock = await myProvider.getBlock("latest");
    console.log('latestBlock', latestBlock.block_number);

    const result = await myProvider.getEvents({
      address: CONTRACT_ADDRESS,
      from_block: { block_number: latestBlock.block_number - 500 },
      // from_block: { block_number: 163778 },
      to_block: { block_number: latestBlock.block_number },
      // keys: myKeys,
      chunk_size: 50,
      continuation_token: undefined,
    });

    const parsed = events.parseEvents(result.events, abiEvents, abiStructs, abiEnums)

    const processingPromises = parsed.map(async (event) => {
      const registeredEvent = event[REGISTERED];
      const bookedEvent = event[BOOKED];
      const extendedEvent = event[EXTENDED];
      const endedEvent = event[ENDED];
      const penaltyImposedEvent = event[PENALTY_IMPOSED];
      const paymentTokenAddedEvent = event[PAYMENT_TOKEN_ADDED];

      // Check if the event is a registered event
      if (registeredEvent) {
        const registeredEventId = registeredEvent.lot_id.toString();

        const ParkingLot = await starkParking.get_parking_lot(registeredEventId);

        if (ParkingLot) {
          const existingParkingLot = await ParkingLotModel.findOne({ lot_id: ParkingLot.lot_id.toString() });
          if (!existingParkingLot) {
            const parkingLot = new ParkingLotModel({
              lot_id: ParkingLot.lot_id.toString(),
              name: parseBNToStr(ParkingLot.name.toString()),
              location: parseBNToStr(ParkingLot.location.toString()),
              coordinates: parseBNToStr(ParkingLot.coordinates.toString()),
              slot_count: Number(ParkingLot.slot_count.toString()),
              hourly_rate_usd_cents: Number(ParkingLot.hourly_rate_usd_cents.toString()),
              creator: toHex(ParkingLot.creator.toString()),
              wallet_address: toHex(ParkingLot.wallet_address.toString()),
              is_active: ParkingLot.is_active,
              registration_time: new Date(Number(ParkingLot.registration_time.toString()) * 1000),
            });

            // Save the parking lot to MongoDB
            try {
              await parkingLot.save();
              console.log('Parking lot saved to MongoDB:', parkingLot);
            } catch (error) {
              console.error('Error saving parking lot to MongoDB:', error);
            }
          }
        }
      }
      if (bookedEvent) {
        const bookingId = parseBNToStr(bookedEvent.booking_id.toString());
        const licensePlate = parseBNToStr(bookedEvent.license_plate.toString());
        const entryTime = new Date(Number(bookedEvent.entry_time.toString()) * 1000);

        const existingBookingId = await BookingModel.findOne({ booking_id: bookingId });

        if (!existingBookingId) {
          // Create a new booking instance
          const booking = new BookingModel({
            license_plate: licensePlate,
            booking_id: bookingId,
            lot_id: bookedEvent.lot_id.toString(),
            entry_time: entryTime,
            exit_time: null,
            expiration_time: new Date(entryTime.getTime() + (Number(bookedEvent.duration.toString()) * 60 * 60 * 1000)), // Example: adding 2 hours for expiration
            total_payment: Number(bookedEvent.total_payment.toString()),
            payer: ''
          });

          // Save the booking to MongoDB
          try {
            await booking.save();
            console.log('Booking saved to MongoDB:', booking);
          } catch (error) {
            console.error('Error saving booking to MongoDB:', error);
          }
        }
      }
      if (extendedEvent) {
        console.log('extendedEvent', extendedEvent);
        let booking_id = extendedEvent?.booking_id.toString();
        booking_id = parseBNToStr(booking_id);
        console.log('extendedEvent booking_id', booking_id);
        // try {
        //     const booking = await BookingModel.findOne({ booking_id: booking_id });
        //     if (booking) {
        //       // Update total_payment and expiration_time
        //       booking.total_payment = Number(extendedEvent.total_payment.toString());
        //       booking.expiration_time = new Date(booking.expiration_time.getTime() + (extendedEvent.additional_hours * 60 * 60 * 1000)); // Update expiration_time
        //       // Save the updated booking
        //       await booking.save();
        //       console.log('Booking updated:', booking);
        //     } else {
        //       console.error('Booking not found for booking_id:', booking_id);
        //     }
        // } catch (error) {
        //     console.error('Error updating booking:', error);
        // }
      }
      if (endedEvent) {
        let booking_id = endedEvent?.booking_id.toString();
        booking_id = parseBNToStr(booking_id);
        try {
          const booking = await BookingModel.findOne({ booking_id: booking_id });
          if (booking && booking.exit_time === null) {
            // Update exit_time and total_payment
            booking.exit_time = new Date(Number(endedEvent.exit_time.toString()) * 1000);
            booking.total_payment = Number(endedEvent.total_payment.toString());

            // Save the updated booking
            await booking.save();
            console.log('Booking updated:', booking);
          }
        } catch (error) {
          console.error('Error updating booking:', error);
        }
      }
      if (penaltyImposedEvent) {
        console.log('penaltyImposedEvent', penaltyImposedEvent);
      }
      if (paymentTokenAddedEvent) {
        console.log('paymentTokenAddedEvent', paymentTokenAddedEvent);
        let token = paymentTokenAddedEvent?.payment_token.toString();
        token = toHex(token);
        console.log('token', token);
      }
    });

    // Wait for all processing promises to complete
    await Promise.all(processingPromises);
    // }
  } catch (error) {
    console.error('Error while listening to contract events:', error.message);
  }
};

// Poll the latest block every 60 seconds
main();
setInterval(main, 30000);