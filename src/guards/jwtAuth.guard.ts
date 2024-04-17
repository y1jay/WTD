import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { baseConfig } from 'src/config/base.config';
// import { Admin } from 'src/interface/user';
@Injectable()
export class jwtAuthGuard extends AuthGuard(['access', 'refresh']) {
	canActivate(context: ExecutionContext) {
		// if ( == context.getClass()) {
		// 	return true;
		// }
		// const request = context.switchToHttp().getRequest();

		// const res = context.switchToHttp().getResponse();
		// console.log(request, 'RESRESRSE');
		// const token = this.extractTokenFromHeader(request);

		if ([''].includes(context.getHandler().name)) {
			return true;
		}

		return super.canActivate(context);
	}

	handleRequest(err, admin) {
		console.log(admin, '!');
		// You can throw an exception based on either "info" or "err" arguments
		if (err || !admin) {
			throw err || new UnauthorizedException();
		}
		return admin;
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		// console.log(request.headers['cookie'].split(' '), 'REQUEST!!!');
		// const a = request.headers['authorization'];
		// console.log(a, 'AAAAAA');
		// console.log(request.headers['cookie']?.split(' ') ?? [], 'REQUEST!!!');
		const cookie = request.headers['cookie']?.split(' ') ?? [];
		// console.log(request, 'REQUEST');

		return cookie[cookie.length - 1];
	}
}

