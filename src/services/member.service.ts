import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from 'src/entities/Member.entity';
import { QueryResult, Repository } from 'typeorm';
import { MemberI } from 'src/interface/Member';
import { getNow } from 'src/common/util';
import { MemberLoginHistory } from 'src/entities/MemberLoginHistory.entity';
import { JwtService } from '@nestjs/jwt';
import { baseConfig } from 'src/config/base.config';
import { WhatToDoHistory } from 'src/entities/WhatToDoHistory.entity';
import { MemberCrown } from 'src/entities/MemberCrown.entity';
const md5 = require('md5');
@Injectable()
export class MemberService {
	constructor(
		@InjectRepository(Member)
		private readonly member: Repository<Member>,
		@InjectRepository(MemberLoginHistory)
		private readonly loginHistory: Repository<MemberLoginHistory>,
		@InjectRepository(WhatToDoHistory)
		private readonly wtdHistory: Repository<WhatToDoHistory>,
		@InjectRepository(MemberCrown)
		private readonly crown: Repository<MemberCrown>,

		private readonly jwt: JwtService
	) {}

	// 회원 조회
	async GetMember(memberIdx: number): Promise<Member> {
		return this.member.findOne({ where: { memberIdx: memberIdx } });
	}

	// 회원 가입
	async JoinMember(params: MemberI): Promise<any> {
		params.pw = md5(params.pw);
		params.joinDate = Number(getNow());
		return await this.member.createQueryBuilder().insert().values(params).execute();
	}

	// 로그인
	async LoginMember(params: any): Promise<Member[]> {
		let result = [];
		params.pw = md5(params.pw);
		const loginDate = Number(getNow());
		const member = await this.member.findOne({ where: { id: params.id, pw: params.pw } });
		if (!member) {
			throw new BadGatewayException('회원정보가 없습니다.');
		}
		const history = await this.loginHistory
			.createQueryBuilder()
			.insert()
			.values({ memberIdx: member.memberIdx, loginDate: loginDate, loginIp: params.loginIp })
			.execute();
		if (!history.raw.insertId) {
			throw new BadRequestException('로그인 이력 실패');
		}
		const payload: MemberI = member;
		const token = this.jwt.sign(payload, { expiresIn: baseConfig.jwt.expiresIn.accessToken });
		const refreshToken = this.jwt.sign(payload, { expiresIn: baseConfig.jwt.expiresIn.refreshToken });
		result.push({ admin: payload, accessToken: token, refreshToken: refreshToken });
		return result;
	}

	// 뽑기 이력
	async MemberWTDHistory(params: any): Promise<WhatToDoHistory[]> {
		return await this.wtdHistory
			.createQueryBuilder()
			.select('result', 'favorite')
			.where({ memberIdx: params.memberIdx })
			.andWhere({ useYn: 1 })
			.orderBy('wtdHistoryIdx', 'DESC')
			.offset(params.list)
			.limit(params.listSize)
			.getRawMany();
	}

	// 칭호 사용
}

