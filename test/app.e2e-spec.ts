import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/api/v1 (GET)', () => {
        return request(app.getHttpServer())
            .get('/api/v1')
            .expect(200)
            .expect(
                'Welcome to M wallets!, please go to this url https://documenter.getpostman.com/view/11690328/UzQvtRBn to view our documentation',
            );
    });
});
