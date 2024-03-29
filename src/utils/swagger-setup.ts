import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const SwaggerInit = (app: INestApplication) => {
    const config = new DocumentBuilder()
        .setTitle('Moni wallet API')
        .setDescription('The documentation for the moni wallet API')
        .setVersion('1.0.0')
        .addTag('wallets')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
};
