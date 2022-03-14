import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { SendGridModule } from "../../shared/modules/sendgrid"
import { UserController } from "./UserController"
import { UserTracking, UserInfo } from "./Entity"
import { UserService } from "./UserService"
import { JwtModule } from "@nestjs/jwt"
import { jwtConstants, JwtStrategy } from "../../shared/strategy/JwtStrategy"
import { PassportModule } from "@nestjs/passport"

const privateKey = `${jwtConstants.secret}`

@Module({
    imports: [
        TypeOrmModule.forFeature([UserInfo, UserTracking]),
        SendGridModule,
        PassportModule,
        JwtModule.register({
            secret: privateKey,
            signOptions: { expiresIn: '60m' },
            verifyOptions: {
                algorithms: ["HS256", "HS512"]
            }
        }),
    ],
    providers:[UserService, JwtStrategy],
    controllers: [UserController]
})
export class UserModule {}