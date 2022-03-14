import { Global, Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices"
import { ConsumeController, ProduceService } from "."

@Global()
@Module({
  imports: [
    ClientsModule.register([{
      name: 'USRCLIENT',
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'userprofileId',
          brokers: ['localhost:9092'],
        },
        consumer: {
            groupId: 'metax-usr-group',
        }
      }
    }]),
  ],
  providers: [ProduceService],
  exports: [ProduceService],
  controllers: [ConsumeController]
})
export class KafkaModule {}