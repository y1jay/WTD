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
import { MemberService } from 'src/services/member.service';

export interface Response<T> {
	statusCode: number;
	message: string;
	error?: string;
	data?: T;
}
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
	constructor(private readonly memberService: MemberService) {} // private jwtService: JwtService,

	async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
		const request = context.switchToHttp().getRequest();
		console.log(context.getHandler().name, 'CONTEXT');
		return next.handle().pipe(
			map(async (data) => {
				if (request['user']) {
					if (
						request['user'].deviceUuid !=
						(await this.memberService.MemberRaw(request['user'].memberIdx)).deviceUuid
					) {
						return {
							statusCode: 404,
							message: 'duplicate',
						};
					}
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

