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
import { MemberCrown } from './entities/MemberCrown.entity';
import { Member } from './entities/Member.entity';
import { MemberNickHistory } from './entities/MemberNickHistory.entity';
import { MemberTicketHistory } from './entities/MemberTicketHistory.entity';
import { WhatToDo } from './entities/WhatToDo.entity';
import { WhatToDoHistory } from './entities/WhatToDoHistory.entity';
import { MemberLoginHistory } from './entities/MemberLoginHistory.entity';
import { MemberController } from './controllers/member.controller';
import { MemberService } from './services/member.service';
import { Crown } from './entities/Crown.entity';

@Module({
	imports: [
		TypeOrmModule.forRoot(databaseConfig),
		TypeOrmModule.forFeature([
			MemberCrown,
			Member,
			MemberLoginHistory,
			MemberNickHistory,
			MemberTicketHistory,
			WhatToDo,
			WhatToDoHistory,
			Crown,
		]),
		JwtModule.register({
			secret: baseConfig.jwt.secret,
			// signOptions: { expiresIn: baseConfig.jwt.expiresIn.accessToken },
		}),

		PassportModule,
	],
	controllers: [AppController, MemberController],
	providers: [
		{ provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
		// {
		// 	provide: APP_GUARD,
		// 	useClass: jwtAuthGuard,
		// },
		JwtAccessStrategy,
		JwtRefreshStrategy,
		AppService,
		MemberService,
	],
	exports: [PassportModule],
})
export class AppModule {}

