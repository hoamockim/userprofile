import { Injectable } from '@nestjs/common'
import * as SendGrid from '@sendgrid/mail'

@Injectable()
export class SendgridService {
    constructor() {
        SendGrid.setApiKey(process.env.SENDGRID_KEY);
    }

    async send(mail: SendGrid.MailDataRequired) {
        const transport = await SendGrid.send(mail);
        return transport;
    }
}
