import { consumer } from '../config/kafka.js';
import Booking from '../models/Booking.js';

export const startBookingConsumer = async () => {
  await consumer.subscribe({ topic: 'payment-completed', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const data = JSON.parse(message.value.toString());

      if (topic === 'payment-completed') {
        await Booking.findByIdAndUpdate(data.bookingId, { status: 'Confirmed' });
        console.log(`[Kafka] Booking ${data.bookingId} confirmed!`);
      }
    },
  });
};