import { SignType } from "./RegisterType"

export class SignInData {
    accessToken: string
}

export class ResponseDto {
    code: number
    message: string
    data: any

    public static error(code: number, message: string): ResponseDto {
        const res = new ResponseDto()
        res.code = code
        res.message = message
        return res
    }

    public static success(data: any): ResponseDto {
        const res = new ResponseDto()
        res.code = 200
        res.data = data
        return res
    }
}

export const USERNOTFOUND = "User not found"
export const USERNOTACTIVE = "User not active"

export class SignInRequest {
    email: string
    password: string
}

export class ChangePassRequest{
    oldPass: string
    newPass: string
    renewPass: string
}

export class SignInResponse {
    code: string
    email: string
    signType: SignType
    active: boolean
}

export class ChangPassResponse {
    message: string
}

export type AuthenPayload = {
    type: SignType,
    email: string,
    code: string,
    fullName: string
}