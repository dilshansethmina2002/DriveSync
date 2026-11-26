import crypto from 'crypto';
import { consumer, producer } from '../config/kafka.js';
import Vehicle from '../models/Vehicle.js';
import Maintenance from '../models/Maintenance.js';

const generateMaintenanceId = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `MNT-${datePart}-${randomPart}`;
};

export const startFleetConsumer = async () => {
  await consumer.subscribe({
    topics: ['vehicle-added', 'booking-completed'],
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const data = JSON.parse(message.value.toString());

      try {
        // 1. Sync new vehicle from Catalog Service into Fleet DB
        if (topic === 'vehicle-added') {
          const existing = await Vehicle.findOne({ vehicleId: data.vehicleId });
          if (!existing) {
            const tempReg = `REG-${data.vehicleId.toString().slice(-6).toUpperCase()}`;
            await Vehicle.create({
              vehicleId: data.vehicleId,
              vehicleName: `${data.brand} ${data.model}`.trim(),
              registrationNumber: tempReg,
              currentStatus: data.isAvailable ? 'Available' : 'Under Maintenance',
              statusHistory: [
                {
                  from: null,
                  to: data.isAvailable ? 'Available' : 'Under Maintenance',
                  reason: 'Auto-registered via Kafka vehicle-added event',
                  changedBy: 'system-kafka',
                },
              ],
            });
            console.log(`[Kafka] Registered vehicle ${data.vehicleId} in Fleet DB`);
          }
        }

        // 2. Schedule post-trip inspection when a rental finishes
        if (topic === 'booking-completed') {
          const fleetVehicle = await Vehicle.findOne({ vehicleId: data.vehicleId });
          if (!fleetVehicle) {
            console.warn(`[Kafka] Fleet vehicle ${data.vehicleId} not found for booking-completed`);
            return;
          }

          const previousStatus = fleetVehicle.currentStatus;

          // Create an 'Inspection' maintenance record linked to this booking
          const inspectionRecord = await Maintenance.create({
            maintenanceId: generateMaintenanceId(),
            vehicle: fleetVehicle._id,
            vehicleId: fleetVehicle.vehicleId,
            maintenanceType: 'Inspection',
            description: `Post-rental inspection for completed booking ${data.bookingId}`,
            status: 'In Progress',
            relatedBookingId: data.bookingId,
            performedBy: 'system-kafka',
          });

          // Update Fleet Vehicle status & audit trail
          fleetVehicle.currentStatus = 'Under Maintenance';
          fleetVehicle.maintenanceHistory.push(inspectionRecord._id);
          fleetVehicle.lastReturn = {
            bookingId: data.bookingId,
            returnedAt: new Date(),
            notes: 'Auto-logged from booking-completed event',
          };
          fleetVehicle.statusHistory.push({
            from: previousStatus,
            to: 'Under Maintenance',
            reason: `Post-trip inspection triggered by booking ${data.bookingId}`,
            changedBy: 'system-kafka',
          });
          await fleetVehicle.save();

          // Notify Catalog Service so customers cannot book while under inspection
          await producer.send({
            topic: 'vehicle-status-updated',
            messages: [
              {
                key: fleetVehicle.vehicleId,
                value: JSON.stringify({
                  vehicleId: fleetVehicle.vehicleId,
                  status: 'Under Maintenance',
                }),
              },
            ],
          });

          console.log(
            `[Kafka] Scheduled post-trip inspection (${inspectionRecord.maintenanceId}) & marked ${fleetVehicle.vehicleId} Under Maintenance`
          );
        }
      } catch (err) {
        console.error(`[Kafka] Error processing ${topic}:`, err.message);
      }
    },
  });
};