
export const Susscess = 200
export const DataInvalid = 400
export const IntergrationError = 500

export class ServiceResult {
    code: number
    message: string
    data: {}
}