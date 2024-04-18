import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from 'src/entities/Member.entity';
import { DataSource, QueryResult, Repository } from 'typeorm';
import { MemberI } from 'src/interface/Member';
import { getNow, selectQuery, transaction } from 'src/common/util';
import { MemberLoginHistory } from 'src/entities/MemberLoginHistory.entity';
import { JwtService } from '@nestjs/jwt';
import { baseConfig } from 'src/config/base.config';
import { WhatToDoHistory } from 'src/entities/WhatToDoHistory.entity';
import { MemberCrown } from 'src/entities/MemberCrown.entity';
import { MemberNickHistory } from 'src/entities/MemberNickHistory.entity';
import { async } from 'node-stream-zip';
import { Crown } from 'src/entities/Crown.entity';
import { MemberTicketHistory } from 'src/entities/MemberTicketHistory.entity';
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
		private readonly memberCrown: Repository<MemberCrown>,
		@InjectRepository(MemberNickHistory)
		private readonly nickHistory: Repository<MemberNickHistory>,
		@InjectRepository(Crown)
		private readonly crown: Repository<Crown>,
		@InjectRepository(MemberTicketHistory)
		private readonly ticketHistory: Repository<MemberTicketHistory>,

		private readonly jwt: JwtService,
		private readonly dataSource: DataSource
	) {}

	// 회원 조회
	async GetMember(params: { id: string; pw?: string }): Promise<Member> {
		const member = this.member
			.createQueryBuilder('mm')
			.select([
				'mm.memberIdx as memberIdx',
				'mm.id as id',
				'mm.pw as pw',
				'mm.nick as nick',
				'mm.stateCode as stateCode',
				'mm.joinType as joinType',
				'mm.deviceUuid as deviceUuid',
				'mm.profileImage as profileImage',
				'mm.freeCount as freeCount',
				'mm.paidCount as paidCount',
				'mm.joinDate as joinDate',
				'mm.joinIp as joinIp',
				'mm.leaveDate as leaveDate',
				'mm.leaveIp as leaveIp',
				'ifnull(mc.crown,"") as crown',
			])
			.leftJoin(MemberCrown, 'mc', 'mm.memberIdx = mc.memberIdx and mc.useYn = 1')
			.where({ id: params.id });
		if (params.pw) {
			member.andWhere({ pw: params.pw });
		}
		member.groupBy('mm.memberIdx');
		return await member.getRawOne();
	}
	async MemberRaw(memberIdx: number): Promise<Member> {
		return this.member.findOne({ where: { memberIdx: memberIdx } });
	}

	// 회원 가입
	async JoinMember(params: MemberI): Promise<any> {
		params.pw = md5(params.pw);
		params.joinDate = Number(getNow());
		const member = await this.GetMember({ id: params.id });
		if (member) {
			throw new BadRequestException('중복된 아이디가 있습니다.');
		}

		return await this.member.createQueryBuilder().insert().values(params).execute();
	}

	// 로그인
	async LoginMember(params: any): Promise<Member[]> {
		let result = [];
		params.pw = md5(params.pw);
		const loginDate = Number(getNow());
		const member = await this.member
			.createQueryBuilder('mm')
			.select([
				'mm.memberIdx as memberIdx',
				'mm.id as id',
				'mm.pw as pw',
				'mm.nick as nick',
				'mm.stateCode as stateCode',
				'mm.joinType as joinType',
				'mm.deviceUuid as deviceUuid',
				'mm.profileImage as profileImage',
				'mm.freeCount as freeCount',
				'mm.paidCount as paidCount',
				'mm.joinDate as joinDate',
				'mm.joinIp as joinIp',
				'mm.leaveDate as leaveDate',
				'mm.leaveIp as leaveIp',
				'ifnull(mc.crown,"") as crown',
			])
			.leftJoin(MemberCrown, 'mc', 'mm.memberIdx = mc.memberIdx and mc.useYn = 1 limit 1')
			.where({ id: params.id, pw: params.pw })
			.getRawOne();
		// .findOne({ where: { id: params.id, pw: params.pw } });
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
		// 쿠키에 토큰정보 셋팅
		params.res.cookie(
			'Authorization',
			{ accessToken: token, refreshToken: refreshToken },
			{
				httpOnly: true,
				path: '/',
				maxAge: baseConfig.cookieAge, //1 day
			}
		);
		return params.res.send({ result });
	}

	// 뽑기 이력
	async MemberWTDHistory(params: any): Promise<WhatToDoHistory[]> {
		return await this.wtdHistory
			.createQueryBuilder()
			.select(['result', 'favorite'])
			.where({ memberIdx: params.memberIdx })
			.andWhere({ useYn: 1 })
			.orderBy('wtdHistoryIdx', 'DESC')
			.offset(params.list)
			.limit(params.listSize)
			.getRawMany();
	}

	// 닉네임 변경
	async MemberNickChange(params: any): Promise<QueryResult[]> {
		return await transaction(this.dataSource, async (con: any) => {
			let result = [];

			const nickCnt = await selectQuery(() =>
				con
					.getRepository(MemberNickHistory)
					.createQueryBuilder()
					.select()
					.where({ memberIdx: params.memberIdx, useYn: 1 })
					.andWhere(
						"(case when DATE_FORMAT(substring( reg_date, 1,8) , '%Y-%m' ) > DATE_FORMAT( DATE_ADD( now(), INTERVAL -1 month ), '%Y-%m' ) then 1 else 0 end) =1"
					)
					.getCount()
			);
			if (nickCnt > 0) {
				throw new BadRequestException('닉네임 변경횟수 초과');
			}
			const duplicate = await selectQuery(() =>
				con.getRepository(Member).count({ where: { nick: params.beforeNick } })
			);
			if (duplicate > 0) {
				throw new BadRequestException('중복 된 닉네임');
			}
			const update = await this.member
				.createQueryBuilder()
				.update()
				.set({ nick: params.afterNick })
				.where({ memberIdx: params.memberIdx })
				.execute();
			if ((update.raw.affected = 0)) {
				throw new BadRequestException('닉네임 변경 실패');
			} else {
				result.push(update);
			}
			const history = await this.nickHistory.createQueryBuilder().insert().values(params).execute();
			if ((history.raw.affected = 0)) {
				throw new BadRequestException('닉네임 변경 실패');
			} else {
				result.push(history);
			}
			return result;
		});
	}
	async MemberNickCount(memberIdx: number): Promise<number> {
		return this.nickHistory
			.createQueryBuilder()
			.select()
			.where({ memberIdx: memberIdx, useYn: 1 })
			.andWhere(
				"(case when DATE_FORMAT(substring( reg_date, 1,8) , '%Y-%m' ) > DATE_FORMAT( DATE_ADD( now(), INTERVAL -1 month ), '%Y-%m' ) then 1 else 0 end) =1"
			)
			.getCount();
	}

	// 칭호 획득
	async MemberCrownInsert(params: { memberIdx: number; cIdx: number; regIp: string }): Promise<any> {
		const crown = await this.crown.count({ where: { cIdx: params.cIdx } });
		if (crown == 0) {
			throw new BadRequestException('칭호 정보가 없습니다.');
		}
		const memberCrown = await this.memberCrown.count({ where: { memberIdx: params.memberIdx, cIdx: params.cIdx } });
		if (memberCrown > 0) {
			throw new BadRequestException('이미 획득한 칭호');
		}
		return await this.memberCrown.save({
			memberIdx: params.memberIdx,
			cIdx: params.cIdx,
			useYn: 0,
			bookMark: 0,
			regDate: Number(getNow()),
			regIp: params.regIp,
		});
	}

	// 칭호 사용
	async MemberCrownChange(params: { memberIdx: number; cIdx: number }): Promise<any> {
		return await transaction(this.dataSource, async (con: any) => {
			let result = [];
			const crownUse = await this.memberCrown
				.createQueryBuilder()
				.update()
				.set({ useYn: 1 })
				.where({ memberIdx: params.memberIdx, cIdx: params.cIdx })
				.execute();
			if ((crownUse.raw.affected = 0)) {
				throw new BadRequestException('칭호사용 실패');
			}
			const crownCnt = await selectQuery(() => con.getRepository(MemberCrown).count());
			if (crownCnt > 1) {
				const crownOff = await this.memberCrown
					.createQueryBuilder()
					.update()
					.set({ useYn: 0 })
					.where({ memberIdx: params.memberIdx })
					.andWhere(`cIdx<>${params.cIdx}`)
					.execute();
				if (crownOff.raw.affected == 0) {
					throw new BadRequestException('칭호사용 실패');
				}
			}

			return result;
		});
	}
	// 칭호 즐겨찾기(북마크) 수정
	async MemberBookMark(params: { memberIdx: number; cIdx: number; bookMark: number }): Promise<any> {
		return this.memberCrown
			.createQueryBuilder()
			.update()
			.set({ bookMark: params.bookMark })
			.where({ memberIdx: params.memberIdx, cIdx: params.cIdx })
			.execute();
	}

	// 칭호 리스트
	async MemberCrownList(memberIdx: number): Promise<MemberCrown[]> {
		return this.memberCrown
			.createQueryBuilder('mc')
			.select([
				'mc.memberIdx as memberIdx',
				'mc.cIdx as cIdx',
				'mc.useYn as useYn',
				'mc.bookMark as bookMark',
				'c.crown as crown',
			])
			.innerJoin(Crown, 'c', 'mc.cIdx = c.cIdx and c.useYn = 1')
			.where({ memberIdx: memberIdx })
			.getRawMany();
	}

	// 리워드 지급
	async MemberReward(params: { memberIdx: number; reward: number; type: number; regIp: string }): Promise<any> {
		return await transaction(this.dataSource, async (con: any) => {
			let result = [];
			const member = await selectQuery(() =>
				con.getRepository(Member).findOne({ where: { memberIdx: params.memberIdx } })
			);
			const beforeCount: number = member.paidCount;
			const afterCount = beforeCount + params.reward;
			const ticketHistory = await this.ticketHistory.save({
				memberIdx: params.memberIdx,
				useCount: params.reward,
				beforeCount: beforeCount,
				afterCount: afterCount,
				type: params.type,
				regDate: Number(getNow()),
				regIp: params.regIp,
			});
			if (!ticketHistory) {
				throw new BadRequestException('지급 실패');
			}

			result.push(
				this.member
					.createQueryBuilder()
					.update()
					.set({ paidCount: afterCount })
					.where({ memberIdx: params.memberIdx })
					.execute()
			);
		});
	}

	// TODO: profileImage
	async MemberProfile(params: any): Promise<any> {
		return;
	}

	// 회원탈퇴
	async MemberSignOut(params: { memberIdx: number; leaveIp: string }): Promise<any> {
		return this.member.update(params.memberIdx, {
			stateCode: -999,
			leaveDate: Number(getNow()),
			leaveIp: params.leaveIp,
		});
	}
}

