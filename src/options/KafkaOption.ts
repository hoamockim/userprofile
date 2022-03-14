import { MicroserviceOptions, Transport } from "@nestjs/microservices";

export const KafkaOptions: MicroserviceOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers: ['localhost:9092'],
    },
    consumer: {
        groupId: 'metax-usr-group'
    },
    producer: {
        
    }
  }
}