import { ParkingLotModel } from '../../models/db.js'

// Function to get all parking lots
export const getAllParkingLots = async (req, res) => {
  try {
    // Fetch all parking lots from the database
    const parkingLots = await ParkingLotModel.find();

    // Check if there are no parking lots
    if (parkingLots.length === 0) {
      return res.status(404).json({ result: false, message: 'No parking lots found' });
    }

    // Return the list of parking lots
    return res.status(200).json({ result: true, parkingLots });
  } catch (error) {
    console.error('Error fetching parking lots:', error);
    return res.status(500).json({ result: false, message: 'Error fetching parking lots' });
  }
};

