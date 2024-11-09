import Event from './models/Event.js'; // Import the Event model

// Function to add a new event to the database
export const addEvent = async (eventData) => {
  try {
    const newEvent = new Event(eventData);
    await newEvent.save();
    console.log('Event added to the database:', newEvent);
    return newEvent;
  } catch (error) {
    console.error('Error adding event to the database:', error.message);
    return null;
  }
};

// Function to find an event by its transaction ID
export const findEventByTransactionId = async (transactionId) => {
  try {
    const event = await Event.findOne({ transactionId });
    if (event) {
      console.log('Event found:', event);
      return event;
    } else {
      console.log('No event found with transaction ID:', transactionId);
      return null;
    }
  } catch (error) {
    console.error('Error finding event:', error.message);
    return null;
  }
};

// Function to update an existing event in the database
export const updateEvent = async (transactionId, updateData) => {
  try {
    const updatedEvent = await Event.findOneAndUpdate(
      { transactionId },
      { $set: updateData },
      { new: true } // Return the updated document
    );
    if (updatedEvent) {
      console.log('Event updated:', updatedEvent);
      return updatedEvent;
    } else {
      console.log('No event found with transaction ID:', transactionId);
      return null;
    }
  } catch (error) {
    console.error('Error updating event:', error.message);
    return null;
  }
};

// Function to delete an event from the database by its transaction ID
export const deleteEvent = async (transactionId) => {
  try {
    const deletedEvent = await Event.findOneAndDelete({ transactionId });
    if (deletedEvent) {
      console.log('Event deleted:', deletedEvent);
      return deletedEvent;
    } else {
      console.log('No event found with transaction ID:', transactionId);
      return null;
    }
  } catch (error) {
    console.error('Error deleting event:', error.message);
    return null;
  }
};