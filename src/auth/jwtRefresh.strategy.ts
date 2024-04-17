import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { baseConfig } from 'src/config/base.config';
import { Admin } from '../interface/user';
import { ManagerService } from 'src/services/manager.service';
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
	constructor(private readonly manager: ManagerService) {
		console.log(Strategy, 'ST');
		super({
			// jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request) => {
					let token: string;
					console.log(typeof request.headers.authorization);
					if (typeof request.headers.authorization == 'object') {
						token = request.headers.authorization.refreshToken;
					} else if (typeof request.headers.authorization == 'string') {
						token = JSON.parse(request?.headers?.authorization).refreshToken;
					} else {
						token = request?.cookies?.Authorization.refreshToken;
					}
					// console.log(token, 'refreshToken!');
					return token;
				},
			]),
			ignoreExpiration: false,
			secretOrKey: baseConfig.jwt.secret,
		});
	}
	async validate(payload: Admin) {
		// console.log('AAAAAAAAAAA');

		return payload;
	}
}

