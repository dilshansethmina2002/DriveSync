import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'drivesync-booking-service',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: 'booking-group' });

export const connectKafka = async () => {
  await producer.connect();
  await consumer.connect();
  console.log('Booking Service Kafka connected!');
};