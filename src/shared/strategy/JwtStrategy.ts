import { Injectable } from "@nestjs/common"
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'

export const jwtConstants = {
  secret:   "234403ee-05cb-4b6b-bcdf-dda11aa3937c",
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    return { userCode: payload.code, email: payload.email };
  }
}