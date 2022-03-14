import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import * as bcrypt from 'bcrypt'
import { DataInvalid, ServiceResult, Susscess } from "../ServiceResult"
import StringUtil from "../../util/strings"
import { UserInfo, UserTracking } from "./Entity"
import { RegisterStatus, SignType } from "./RegisterType"
import { AuthenPayload, ChangPassResponse, SignInRequest, SignInResponse } from "./Dto"
import { ProduceService } from "../../shared/modules/kafka"
import { CurrentStatistic, STATISTIC_KEY } from "../../shared/modules/statistic/Entity"
import { SendgridService } from "../../shared/modules/sendgrid/SendGridService"
import { Route } from "../../route"
import { RedisCacheService } from "../../shared/modules/redis"

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserInfo)
        private readonly userRepository: Repository<UserInfo>,
        @InjectRepository(UserTracking)
        private readonly trackingRepository: Repository<UserTracking>,
        @Inject(CACHE_MANAGER) private readonly redisService: RedisCacheService,
        private readonly produce : ProduceService,
        private sendGridService: SendgridService,
    ){}

    async register(email: string, password: string){
        if (!StringUtil.isValidEmail(email) || !StringUtil.isValidPassWord(password)) {
            await this.pushServiceResult(process.env.ACCOUNT_STATUS_EVENT, DataInvalid, "Email or password is invalid", null)
            return
        }
        let userInfo = await this.userRepository.findOne({where: {email: email}, select: ['usercode','isActive', 'activecode']}) as UserInfo
        if (userInfo){
            if (userInfo.isActive){
                await this.pushServiceResult(process.env.ACCOUNT_STATUS_EVENT, DataInvalid, "Account is existed and actived", {...userInfo} )
                return
            }else{
                await this.pushServiceResult(process.env.ACCOUNT_STATUS_EVENT, DataInvalid, "Account is existed and not actived", 
                {...userInfo, email: userInfo.email, status: RegisterStatus.WAITING_ACTIVE })
            }
            return
        }
        userInfo = new UserInfo()
        userInfo.email = email
        userInfo.password =  await bcrypt.hash(password, 10);
        userInfo.registertype = SignType.Local
        userInfo.usercode = StringUtil.generateRandom(22)
        userInfo.activecode = StringUtil.generateRandom(30)
      
        const insertResult = await this.userRepository.insert(userInfo)
        this.trackingRepository.insert({usercode: userInfo.usercode, email: userInfo.email})
        await this.trackingAccountStatistic(true, false, false)
        
        const activeLink =  `${Route.APP_URL}/active?activeCode=${userInfo.activecode}&userCode=${userInfo.usercode}`
        const mail = {
            to: email,
            subject: 'Hello from Metax',
            from: 'hoamockim@gmail.com',
            html: `<h1>Please click the link ${activeLink} to active your account</h1>`,
          };
        await this.sendGridService.send(mail)
        await this.pushServiceResult(process.env.ACCOUNT_STATUS_EVENT, Susscess, "", 
        { email: userInfo.email, userCode: userInfo.usercode, activecode: userInfo.activecode, status: RegisterStatus.WAITING_ACTIVE })
    }

    async trakingSignin(accountInfo: AuthenPayload) {
        let userInfo = await this.userRepository.findOne({where: {email: accountInfo.email} , select:['usercode', 'fullname', 'email', 'registertype'] }) as UserInfo
        if (!userInfo  && accountInfo.type != SignType.Local) {
            //Auto register and set active for firstly sign-in via third party such as facebook, google 
            userInfo = new UserInfo()
            userInfo.email = accountInfo.email
            userInfo.password = await bcrypt.hash("No@passWord08!", 10);
            userInfo.registertype = accountInfo.type
            userInfo.usercode = StringUtil.generateRandom(22)
            userInfo.activecode = StringUtil.generateRandom(30)
            userInfo.isActive = true
            const insertResult = await this.userRepository.insert(userInfo)
            await this.pushServiceResult(process.env.ACCOUNT_STATUS_EVENT, Susscess, "", 
            { userCode: userInfo.usercode, activecode: userInfo.activecode, status: RegisterStatus.NOTNEEDACTIVE })
        }
        //todo: get tracking from redis
        let userTracking = await this.trackingRepository.findOne({where: {usercode: userInfo.usercode}})
        if (!userTracking){
            userTracking = new UserTracking()
            userTracking.signincounter = 0
            userTracking.lastedsignin = 0
        }
        userTracking.usercode= userInfo.usercode
        userTracking.email= accountInfo.email
        userTracking.signincounter += 1
        userTracking.lastedsignin= Math.floor(Date.now()/1000)
       
        await this.trackingRepository.upsert(userTracking, ["usercode"])
    }

    async verify(accountInfo: SignInRequest): Promise<SignInResponse> {
        const signInRes: SignInResponse = new SignInResponse()
        
        const userInfo = await this.userRepository.findOne({where:  {email: accountInfo.email}, select:['usercode','password', 'isActive', 'fullname'] }) as UserInfo
        if (!userInfo) {
            return signInRes
        }

        if(!userInfo.isActive){
            signInRes.active = false
            signInRes.code = userInfo.usercode
            signInRes.email = userInfo.email
            return signInRes
        }

        const isPasswordMatching = await bcrypt.compare(
            accountInfo.password,
            userInfo.password
        )
        if (isPasswordMatching) {
            signInRes.code = userInfo.usercode
            signInRes.email = accountInfo.email
            signInRes.signType = SignType.Local
            signInRes.active = userInfo.isActive
        } 
        return signInRes
    }

    async changePassword(userCode: string, oldPass: string, newPass: string): Promise<ChangPassResponse> {
        const changePassRes: ChangPassResponse = new ChangPassResponse()
        const userInfo = await this.userRepository.findOne({where:  {usercode: userCode}, select:['password', 'isActive'] }) as UserInfo
        if (!userInfo) {
            changePassRes.message = "User not found"
            return changePassRes
        }
        const isPasswordMatching = await bcrypt.compare(
            oldPass,
            userInfo.password
        )
        if(!isPasswordMatching){
            changePassRes.message = "Current password is not exact"
            return changePassRes
        }

        const renwewPassword = await bcrypt.hash(newPass, 10);
        await this.userRepository.createQueryBuilder().
            update(UserInfo).
            set({password: renwewPassword}).
            where({ usercode: userCode}).execute()
        
        changePassRes.message = "Your password is changed sucessfully"
        return changePassRes
    }

    async activeUser(userCode: string, activeCode: string): Promise<boolean>{
        const result = await this.userRepository.createQueryBuilder().
            update(UserInfo).
            set({isActive: true}).
            where({ usercode: userCode, activecode: activeCode }).execute()

        const srvResult = new ServiceResult()
        srvResult.code = Susscess
        srvResult.data = { userCode: userCode, status: 'ACTIVED'}

        await this.trackingAccountStatistic(false, true, true)
        
        this.produce.send(process.env.ACCOUNT_STATUS_EVENT, {
            eventId: StringUtil.generateRandom(22),
            payload: {
                ...srvResult
            }
        })
        return result.affected > 0
    }

    public async getPrivateStatistic(email: string): Promise<UserTracking> {
        return await this.trackingRepository.findOne({where: {email: email}, select: ['email', 'usercode', 'lastedsignin', 'signincounter']})
    }

    public async getstatistic(): Promise<CurrentStatistic> {
        return await this.redisService.get(STATISTIC_KEY) as CurrentStatistic
    }

    async trackingAccountStatistic(signUp: boolean, activeInDay: boolean, activeInWeek: boolean): Promise<CurrentStatistic>{
        const accountStatistic = await this.redisService.get(STATISTIC_KEY) as CurrentStatistic
        if(signUp)
            accountStatistic.SignUp += 1
        if (activeInDay)
            accountStatistic.ActivedInDay += 1
        if (activeInWeek)
            accountStatistic.ActiveIn7Day +=1
        await this.redisService.set(STATISTIC_KEY, accountStatistic)
        return accountStatistic
    }

    private async pushServiceResult( eventName: string, code: number, message: string, data: {}){
        const srvResult = new ServiceResult()
        srvResult.code = code
        srvResult.message = message
        srvResult.data = data

        await this.produce.send(eventName, {
            eventId: StringUtil.generateRandom(22),
            payload: {
                ...srvResult
            }
        })
    }
}