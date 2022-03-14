import { Global, Module } from "@nestjs/common"
import { ScheduleModule } from "@nestjs/schedule"
import { TypeOrmModule } from "@nestjs/typeorm"
import { DailyStatistic } from "./Entity"
import { TasksService } from "./TasksService"

@Global()
@Module({
    imports: [ScheduleModule.forRoot(), 
            TypeOrmModule.forFeature([ DailyStatistic])],
    providers: [TasksService],
    exports: [TasksService]
})
export class StatisticModule {}