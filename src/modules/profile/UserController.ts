import { Body, Controller, Get, Header, HttpStatus, Patch, Post, Req, Scope, UseGuards } from "@nestjs/common"
import { MessagePattern, Payload, Transport } from "@nestjs/microservices"
import { AuthGuard } from "@nestjs/passport"
import { Route } from "../../route"
import StringUtil from "../../util/strings"
import { ResponseDto, USERNOTACTIVE, USERNOTFOUND, AuthenPayload, SignInRequest } from "./Dto"
import { UserService } from "./UserService"

@Controller({
    scope: Scope.REQUEST,
    path: Route.URLV1 + 'user-profile',
})
export class UserController {
    constructor( 
        private readonly userService: UserService,
    ){}

    @Patch("/active")
    @Header('Content-Type', 'application/json')
    async active(@Body() bodyReq){
       return await this.userService.activeUser(bodyReq.userCode, bodyReq.activeCode)
    }

    @UseGuards(AuthGuard('jwt'))
    @Get("/statistic")
    async getStatistic(@Req() req){
        let data = {}
        const total = await this.userService.getstatistic()
        data = { total }
        if (req.query.init=='true') {
            const personal = await this.userService.getPrivateStatistic(req.user.email)
            data = {
                total,
                personal
            }
        }
        return ResponseDto.success({...data})
    }

    @Post("/verify")
    @Header('Content-Type', 'application/json')
    async verify(@Body() accountInfo: SignInRequest): Promise<ResponseDto>{
        const res = await this.userService.verify(accountInfo)
        if (!res.code) {
            return ResponseDto.error(HttpStatus.NOT_FOUND, USERNOTFOUND)
        }
        if(!res.active) {
            return ResponseDto.error(HttpStatus.UNAUTHORIZED, USERNOTACTIVE)
        }
        return ResponseDto.success({...res})
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch("/password/change")
    @Header('Content-Type', 'application/json')
    async changePass(@Req() req): Promise<ResponseDto>{
        if (!req.user) {
            return ResponseDto.error(HttpStatus.BAD_REQUEST, "Data invallid")
        }
        if(req.body.newpass.trim()!= req.body.renewpass.trim()){
            return ResponseDto.error(HttpStatus.BAD_REQUEST, "Invalid new password")
        }
        if (!StringUtil.isValidPassWord(req.body.newpass)) {
            return ResponseDto.error(HttpStatus.BAD_REQUEST, "data invallid")
        }
        const res = await this.userService.changePassword(req.user.userCode, req.body.oldpass, req.body.newpass)
        return ResponseDto.success({...res})
    }

    @MessagePattern("metax.signup.event", Transport.KAFKA)
    async consumSignUpEvent(@Payload()message: any){
        const authenData = message.value.payload
        await this.userService.register(authenData.email, authenData.password)
    }
 
    @MessagePattern("metax.auth.event", Transport.KAFKA)
    async consumSignInEvent(@Payload()message: any){
        const authenData = message.value.payload as AuthenPayload
        await this.userService.trakingSignin(authenData)
    }
}