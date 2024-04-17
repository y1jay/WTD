import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { baseConfig } from './config/base.config';
import { databaseConfig } from './config/database.config';
import { jwtAuthGuard } from './guards/jwtAuth.guard';

import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtAccessStrategy } from './auth/jwtAccess.strategy';
import { JwtRefreshStrategy } from './auth/jwtRefresh.strategy';

@Module({
	imports: [
		TypeOrmModule.forRoot(databaseConfig),
		TypeOrmModule.forFeature([
			//entity
		]),
		JwtModule.register({
			secret: baseConfig.jwt.secret,
			// signOptions: { expiresIn: baseConfig.jwt.expiresIn.accessToken },
		}),

		PassportModule,
	],
	controllers: [AppController],
	providers: [
		{ provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
		{
			provide: APP_GUARD,
			useClass: jwtAuthGuard,
		},
		JwtAccessStrategy,
		JwtRefreshStrategy,
		AppService,
	],
	exports: [PassportModule],
})
export class AppModule {}

