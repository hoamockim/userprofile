import { CACHE_MANAGER, Inject, Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { RedisCacheService } from "../redis"
import { CurrentStatistic, Friday, Monday, Sarturday, Sunday, Thursday, Tuesday, Wednesday, DailyStatistic, STATISTIC_KEY } from "./Entity"

@Injectable()
export class TasksService implements OnApplicationBootstrap  {
  private readonly logger = new Logger(TasksService.name);
  private dailyId: number = 1
  constructor(
      @Inject(CACHE_MANAGER) private readonly redisService: RedisCacheService,
      @InjectRepository(DailyStatistic)
      private readonly repository: Repository<DailyStatistic>,
  ){}

  async onApplicationBootstrap() {
    let dailyStatistic = await this.repository.findOne({order: {id: 'DESC' }})
    
    if (!dailyStatistic || dailyStatistic.dayofweek != this.getCurrentDay()) {
      dailyStatistic =  new DailyStatistic()
      dailyStatistic.dayofweek = this.getCurrentDay()
      await this.repository.insert(dailyStatistic)
    }

    this.dailyId = dailyStatistic.id
    const currentStatistic = {
      SignUp: dailyStatistic.signedup ? dailyStatistic.signedup : 0,
      CurrentDay: this.getCurrentDay(),
      ActivedInDay: dailyStatistic.active ? dailyStatistic.active : 0,
    }
    await this.redisService.set(STATISTIC_KEY, currentStatistic)
  }

  private getCurrentDay(): string {
    switch (new Date().getUTCDay()){
      case 1: return Monday
      case 2: return Tuesday
      case 3: return Wednesday
      case 4: return Thursday
      case 5: return Friday
      case 6: return Sarturday
      default: return Sunday
    }
  }

  private updateStatistic(dailyStatistic: DailyStatistic, currentStatistic: CurrentStatistic) {
    dailyStatistic.dayofweek = currentStatistic.CurrentDay
    dailyStatistic.signedup =  dailyStatistic.signedup < currentStatistic.SignUp ? currentStatistic.SignUp : dailyStatistic.signedup

    switch (currentStatistic.CurrentDay) {
      case Monday:
        dailyStatistic.active = currentStatistic.ActivedInDay
        return
      case Tuesday:
        dailyStatistic.active = currentStatistic.ActivedInDay
        return
      case Wednesday:
        dailyStatistic.active = currentStatistic.ActivedInDay
        return
      case Thursday:
        dailyStatistic.active = currentStatistic.ActivedInDay
        return
      case Friday:
        dailyStatistic.active = currentStatistic.ActivedInDay
        return
      case Sarturday:
        dailyStatistic.active = currentStatistic.ActivedInDay
        return
      default:
        dailyStatistic.active = currentStatistic.ActivedInDay
        return
    }
  }

  @Cron("0 24 * * *",)
  async cronResetForNewDay() {
    const dailyStatistic = await this.repository.findOne({where: {id: this.dailyId}})
    const accountStatistic = await this.redisService.get(STATISTIC_KEY) as CurrentStatistic
    this.updateStatistic(dailyStatistic, accountStatistic)
    await this.repository.save(dailyStatistic) // end of day
    
    //reset statistic for new day
    accountStatistic.ActivedInDay = 0
    accountStatistic.CurrentDay =  this.getCurrentDay()
    accountStatistic.SignUp = dailyStatistic.signedup

    this.redisService.set(STATISTIC_KEY, accountStatistic)
  }

 @Cron(CronExpression.EVERY_10_SECONDS)
  async cronStatistic(){
    let dailyStatistic = await this.repository.findOne({where: {id: this.dailyId}})
    const currentStatistic = await this.redisService.get(STATISTIC_KEY) as CurrentStatistic
    this.updateStatistic(dailyStatistic, currentStatistic)
    await this.repository.save(dailyStatistic)
    await this.averangeActive7DayRolling(currentStatistic)
    await this.redisService.set(STATISTIC_KEY, currentStatistic)
  }

  async averangeActive7DayRolling(currentStatistic: CurrentStatistic){
    const dailyStatistics =  await this.repository.createQueryBuilder().limit(7).orderBy("id", "DESC").execute() as DailyStatistic[]
    let totalActive: number = 0
    dailyStatistics.forEach(daily => {
      totalActive +=  daily.active ? daily.active : 0
    })
    currentStatistic.ActiveIn7Day = totalActive
  }
}