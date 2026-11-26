import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'drivesync-payment-service',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: 'payment-group' });

export const connectKafka = async () => {
  await producer.connect();
  await consumer.connect();
  console.log('Payment Service Kafka connected!');
};