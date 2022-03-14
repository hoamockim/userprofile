import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm"

export type CurrentStatistic = {
    SignUp: number,
    CurrentDay: string,
    ActivedInDay: number,
    ActiveIn7Day: number
}

export const Monday = "Monday"
export const Tuesday = "Tuesday"
export const Wednesday = "Wednesday"
export const Thursday = "Thursday"
export const Friday = "Friday"
export const Sarturday = "Sarturday"
export const Sunday = "Sunday"

@Entity("daily_statistic")
export class DailyStatistic {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: true})
    signedup: number

    @Column({nullable: true})
    active: number

    @Column({nullable: true})
    dayofweek: string

    @CreateDateColumn()
    createdTime: string

    @CreateDateColumn()
    updatedTime: string
}


export const STATISTIC_KEY = "metax:user:statistic"