import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
const fs = require('fs');

async function bootstrap() {
	const httpsOptions = {};

	const app = await NestFactory.create(AppModule);
	const config = new DocumentBuilder().addBearerAuth().build();
	const document = SwaggerModule.createDocument(app, config);
	// app.enableCors({
	// 	// origin: true,
	// 	origin: ['http://localhost:3000'],
	// 	credentials: true,
	// 	// exposedHeaders: ['Authorization'], // * 사용할 헤더 추가.
	// });
	const corsOptions: CorsOptions = {
		origin: ['http://localhost:1111'], // 프론트엔드 앱의 도메인을 지정
		credentials: true, // 인증 정보 (쿠키 등)를 포함할 경우 true로 설정
	};
	app.enableCors(corsOptions);

	SwaggerModule.setup('ApiDocument', app, document);
	app.use(cookieParser());
	await app.listen(20000);
}

bootstrap();

