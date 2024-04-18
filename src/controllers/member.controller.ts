import { Body, Controller, DefaultValuePipe, Get, Ip, Param, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { getNow } from 'src/common/util';
import { Member } from 'src/entities/Member.entity';
import { MemberCrown } from 'src/entities/MemberCrown.entity';
import { WhatToDoHistory } from 'src/entities/WhatToDoHistory.entity';
import { BooleanNumberPipe, RequiredValidationPipe } from 'src/pipes/custom.pipe';
import { MemberService } from 'src/services/member.service';

@Controller('member')
@ApiTags('회원')
export class MemberController {
	constructor(private readonly memberService: MemberService) {}

	@Get('getMember')
	@ApiOperation({ summary: '회원 조회' })
	@ApiQuery({
		name: 'id',
		type: 'string',
		required: true,
	})
	@ApiQuery({
		name: 'pw',
		type: 'string',
		required: false,
	})
	async getMember(@Query('id', RequiredValidationPipe) id: string, @Query('pw') pw: string): Promise<any> {
		return this.memberService.GetMember({ id, pw });
	}

	@Post('sign')
	@ApiOperation({ summary: '회원가입' })
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				id: { example: '아이디' },
				pw: { example: '비밀번호' },
				nick: { example: '닉네임' },
				stateCode: { example: '상태코드' },
				joinType: { example: '가입경로' },
				deviceUuid: { example: '디바이스 일련번호' },
				profileImage: { example: '프로필이미지' },
			},
		},
	})
	async sign(
		@Body('id') id: string,
		@Body('pw') pw: string,
		@Body('nick') nick: string,
		@Body('stateCode', new DefaultValuePipe(0)) stateCode: number,
		@Body('joinType') joinType: string,
		@Body('deviceUuid') deviceUuid: string,
		@Body('profileImage', new DefaultValuePipe('')) profileImage: string,
		@Body('freeCount', new DefaultValuePipe(0)) freeCount: number,
		@Body('paidCount', new DefaultValuePipe(0)) paidCount: number,
		@Ip() joinIp: string
	): Promise<any> {
		return this.memberService.JoinMember({
			id,
			pw,
			nick,
			stateCode,
			joinType,
			deviceUuid,
			profileImage,
			freeCount,
			paidCount,
			joinDate: Number(getNow()),
			joinIp,
		});
	}

	@Get('login')
	@ApiOperation({ summary: '로그인' })
	@ApiQuery({
		name: 'id',
		type: 'string',
		required: true,
	})
	@ApiQuery({
		name: 'pw',
		type: 'string',
		required: true,
	})
	async login(
		@Query('id', RequiredValidationPipe) id: string,
		@Query('pw', RequiredValidationPipe) pw: string
	): Promise<Member[]> {
		return this.memberService.LoginMember({ id, pw });
	}

	@Get('wtdHistory')
	@ApiOperation({ summary: 'wtd이력' })
	@ApiQuery({
		name: 'memberIdx',
		type: 'number',
		required: true,
	})
	@ApiQuery({
		name: 'page',
		type: 'number',
		required: false,
	})
	@ApiQuery({
		name: 'listSize',
		type: 'number',
		required: false,
	})
	async wtdHistory(
		@Query('memberIdx', RequiredValidationPipe) memberIdx: number,
		@Query('page') page: number,
		@Query('listSize', new DefaultValuePipe(10)) listSize: number
	): Promise<WhatToDoHistory[]> {
		const limit = (page - 1) * listSize;
		return this.memberService.MemberWTDHistory({ memberIdx, limit, listSize });
	}

	@Post('nickChange')
	@ApiOperation({ summary: '닉네임변경' })
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				memberIdx: { example: '회원일련번호' },
				afterNick: { example: '변경닉네임' },
				beforeNick: { example: '이전닉네임' },
			},
		},
	})
	async nickChange(
		@Body('memberIdx', RequiredValidationPipe) memberIdx: number,
		@Body('afterNick', RequiredValidationPipe) afterNick: string,
		@Body('beforeNick', RequiredValidationPipe) beforeNick: string,
		@Body('comment', new DefaultValuePipe('')) comment: string,
		@Ip() regIp: string
	): Promise<any> {
		return this.memberService.MemberNickChange({
			memberIdx,
			beforeNick,
			afterNick,
			regDate: Number(getNow()),
			regIp,
			changeType: 0,
			useYn: 1,
			comment,
		});
	}

	@Get('nickCount/:memberIdx')
	@ApiOperation({ summary: '닉네임이력' })
	@ApiParam({
		name: 'memberIdx',
		type: 'number',
		required: true,
	})
	async nickCount(@Param('memberIdx', RequiredValidationPipe) memberIdx: number): Promise<number> {
		return this.memberService.MemberNickCount(memberIdx);
	}

	@Post('getCrown')
	@ApiOperation({ summary: '칭호획득' })
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				memberIdx: { example: '회원일련번호' },
				cIdx: { example: '칭호 일련번호' },
			},
		},
	})
	async getCrown(
		@Body('memberIdx', RequiredValidationPipe) memberIdx: number,
		@Body('cIdx', RequiredValidationPipe) cIdx: number,
		@Ip() regIp: string
	): Promise<any> {
		return this.memberService.MemberCrownInsert({
			memberIdx,
			cIdx,
			regIp,
		});
	}
	@Post('crownChange')
	@ApiOperation({ summary: '칭호사용' })
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				memberIdx: { example: '회원일련번호' },
				cIdx: { example: '칭호 일련번호' },
			},
		},
	})
	async crownChange(
		@Body('memberIdx', RequiredValidationPipe) memberIdx: number,
		@Body('cIdx', RequiredValidationPipe) cIdx: number
	): Promise<any> {
		return this.memberService.MemberCrownChange({
			memberIdx,
			cIdx,
		});
	}

	@Post('crownBookMark')
	@ApiOperation({ summary: '칭호즐겨찾기' })
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				memberIdx: { example: '회원일련번호' },
				cIdx: { example: '칭호 일련번호' },
			},
		},
	})
	async crownBookMark(
		@Body('memberIdx', RequiredValidationPipe) memberIdx: number,
		@Body('cIdx', RequiredValidationPipe) cIdx: number,
		@Body('bookMark', new DefaultValuePipe(1), BooleanNumberPipe) bookMark: number
	): Promise<any> {
		return this.memberService.MemberBookMark({
			memberIdx,
			cIdx,
			bookMark,
		});
	}

	@Get('crownList/:memberIdx')
	@ApiOperation({ summary: '칭호리스트' })
	@ApiParam({
		name: 'memberIdx',
		type: 'number',
		required: true,
	})
	async crownList(@Query('memberIdx', RequiredValidationPipe) memberIdx: number): Promise<MemberCrown[]> {
		return this.memberService.MemberCrownList(memberIdx);
	}

	@Post('reward')
	@ApiOperation({ summary: '리워드 지급' })
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				memberIdx: { example: '회원일련번호' },
				reward: { example: '리워드' },
				type: { example: '유료:1 무료:0' },
			},
		},
	})
	async reward(
		@Body('memberIdx', RequiredValidationPipe) memberIdx: number,
		@Body('reward', RequiredValidationPipe) reward: number,
		@Body('type', BooleanNumberPipe) type: number,
		@Ip() regIp: string
	): Promise<any> {
		return this.memberService.MemberReward({
			memberIdx,
			reward,
			type,
			regIp,
		});
	}

	@Post('signOut')
	@ApiOperation({ summary: '회원탈퇴' })
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				memberIdx: { example: '회원일련번호' },
			},
		},
	})
	async signOut(@Body('memberIdx', RequiredValidationPipe) memberIdx: number, @Ip() leaveIp: string): Promise<any> {
		return this.memberService.MemberSignOut({
			memberIdx,
			leaveIp,
		});
	}
}

