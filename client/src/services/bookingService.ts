import axios from 'axios';

export interface BookingInput {
  name: string;
  email: string;
  company?: string;
  businessSize?: string;
  challenges?: string;
  date: string;
  timeSlot: string;
}

export const bookingService = {
  createBooking: async (data: BookingInput) => {
    return axios.post('/api/bookings', data);
  },

  getBookedDates: async () => {
    return axios.get('/api/bookings/booked-dates');
  }
};
