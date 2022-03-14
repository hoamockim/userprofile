import { Global, Module } from "@nestjs/common"
import { SendgridService } from "./SendGridService"

@Global()
@Module({
    providers: [SendgridService],
    exports: [SendgridService],
})
export class SendGridModule {

}