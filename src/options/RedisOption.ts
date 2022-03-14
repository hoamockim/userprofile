import { MicroserviceOptions, Transport } from "@nestjs/microservices";

export const RedisOption: MicroserviceOptions = {
  transport: Transport.REDIS,
  options: {
      url: process.env.REDIS,
      connect_timeout: 15,
  },
}