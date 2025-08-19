import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication, port: number, prefix: string): void {
  const config = new DocumentBuilder()
    .setTitle('ODRI System API')
    .setDescription('API documentation for the ODRI billing system')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer(`http://localhost:${port}/${prefix}`, 'Development server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${prefix}/docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}