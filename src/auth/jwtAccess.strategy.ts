import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { baseConfig } from 'src/config/base.config';
import { request } from 'http';
// import { User } from '../interface/user';
// import { Admin } from 'src/interface/admin';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'access') {
	constructor() {
		super({
			// jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request) => {
					let token: string;
					console.log(typeof request.headers.authorization);
					if (typeof request.headers.authorization == 'object') {
						token = request.headers.authorization.accessToken;
					} else if (typeof request.headers.authorization == 'string') {
						token = JSON.parse(request?.headers?.authorization).accessToken;
					} else {
						token = request?.cookies?.Authorization.accessToken;
					}
					// console.log(token, 'accessToken!');
					return token;
					// return request?.cookies?.Authorization;
				},
			]),
			ignoreExpiration: false,
			secretOrKey: baseConfig.jwt.secret,
		});
	}
	async validate(payload: any) {
		return payload;
	}
}

