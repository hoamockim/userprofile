import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("user_info")
export class UserInfo  {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    usercode: string

    @Column()
    email: string

    @Column()
    password: string


    @Column({nullable:true})
    fullname: string

    @Column()
    activecode: string

    @Column({default: false})
    isActive: boolean

    @Column({nullable:true})
    phonenumber: string

    @Column()
    registertype: number

    @CreateDateColumn()
    createdTime: string

    @UpdateDateColumn()
    updatedTime: string
}

@Entity("user_tracking")
export class UserTracking {
    @PrimaryGeneratedColumn()
    id: number

    @Column({unique: true, nullable: false})
    usercode: string

    @Column({name: "email", nullable: true})
    email: string

    @Column({name: "signincounter", nullable: true, default: 0})    
    signincounter: number

    @Column({name: "lastedsignin", nullable: true})
    lastedsignin: number
}

