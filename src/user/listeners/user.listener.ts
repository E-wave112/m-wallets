import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserNotification } from '../events';
import { MailService } from '../../mail/mail.service';

@Injectable()
export class UserEventListener {
    constructor(private readonly mailService: MailService) {}
    @OnEvent('user.*')
    async handleUserEvent(event: UserNotification) {
        // handle and process "handleUserEvent" event
        const emailEvent = await this.mailService.send(event);
        return emailEvent;
    }
}
