import { Request, Response } from 'express';
import Booking from '../models/Booking';

// @desc    Create a new booking session
// @route   POST /api/bookings
// @access  Public
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, company, businessSize, challenges, date, timeSlot } = req.body;

    if (!name || !email || !date || !timeSlot) {
      res.status(400).json({ success: false, message: 'Please fill in Name, Email, Date and Time Slot.' });
      return;
    }

    // Check if the specific date and timeslot is already booked and active (ongoing)
    const existingBooking = await Booking.findOne({ date, timeSlot, status: 'ongoing' });
    if (existingBooking) {
      res.status(400).json({ success: false, message: 'This slot is already booked. Please select another slot.' });
      return;
    }

    // Create booking
    const booking = await Booking.create({
      name,
      email,
      company,
      businessSize,
      challenges,
      date,
      timeSlot,
      status: 'ongoing'
    });

    res.status(201).json({
      success: true,
      message: 'Your career strategy session has been booked successfully! 🎉',
      booking
    });
  } catch (error: any) {
    console.error('Create Booking Error:', error);
    res.status(500).json({ success: false, message: 'Server error while booking session.' });
  }
};

// @desc    Get all booked slots to display on the calendar
// @route   GET /api/bookings/booked-dates
// @access  Public
export const getBookedDates = async (req: Request, res: Response): Promise<void> => {
  try {
    // Only return ongoing sessions that are active
    const bookings = await Booking.find({ status: 'ongoing' }).select('date timeSlot -_id');
    res.json({
      success: true,
      bookedSlots: bookings
    });
  } catch (error: any) {
    console.error('Get Booked Dates Error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving booked slots.' });
  }
};
