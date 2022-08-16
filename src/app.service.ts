import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    getHello(): string {
        return 'Welcome to M wallets!, please go to this url https://documenter.getpostman.com/view/11690328/UzQvtRBn to view our documentation';
    }
}
