import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UserInfo, UserTracking } from './modules/profile/Entity'
import { UserModule } from './modules/profile/UserModule'
import { KafkaModule, RedisCacheModule, StatisticModule } from './shared/modules'
import { DailyStatistic } from './shared/modules/statistic/Entity'
import { SendgridService } from './shared/modules/sendgrid/SendGridService';
import { SendGridModule } from './shared/modules/sendgrid'

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PWD,
      entities: [UserInfo, UserTracking, DailyStatistic],
      synchronize: true,
    }),
    KafkaModule,
    RedisCacheModule,
    SendGridModule,
    StatisticModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService, SendgridService],
})
export class AppModule {}
