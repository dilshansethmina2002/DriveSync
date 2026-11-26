import { consumer } from '../config/kafka.js';
import Vehicle from '../models/Vehicle.js';

export const startCatalogConsumer = async () => {
  await consumer.subscribe({ topic: 'vehicle-status-updated', fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const { vehicleId, status } = JSON.parse(message.value.toString());

      if (topic === 'vehicle-status-updated') {
        const isAvailable = status === 'Available';
        await Vehicle.findByIdAndUpdate(vehicleId, { isAvailable });
        console.log(`[Kafka] Vehicle ${vehicleId} availability set to: ${isAvailable}`);
      }
    },
  });
};