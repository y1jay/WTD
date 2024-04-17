import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
	HttpException,
	BadRequestException,
} from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getNow, hasProperty } from 'src/common/util';
import { baseConfig } from 'src/config/base.config';

export interface Response<T> {
	statusCode: number;
	message: string;
	error?: string;
	data?: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
	constructor() // private jwtService: JwtService,
	{}

	async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
		const request = context.switchToHttp().getRequest();
		console.log(context.getHandler().name, 'CONTEXT');
		return next.handle().pipe(
			map(async (data) => {
				if ([''].includes(context.getHandler().name)) {
					console.log(data, 'DATA@!#@!#@!#!#!@#@!@!');
					return data;
				}

				if (
					(Array.isArray(data) && !data.map((val: any) => hasProperty(val)).includes(false)) ||
					(hasProperty(data) && (data.raw.affectedRows > 0 || data.affected > 0))
				) {
				} else if (hasProperty(data) && (data.raw.affectedRows === 0 || data.affected === 0)) {
					return {
						statusCode: 409,
						message: 'fail',
					};
				}

				return {
					statusCode: 200,
					message: 'success',
					data: data,
				};
			})
		);
	}
}

