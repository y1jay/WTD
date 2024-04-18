import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getNow, selectQuery, transaction } from 'src/common/util';
import { Member } from 'src/entities/Member.entity';
import { MemberTicketHistory } from 'src/entities/MemberTicketHistory.entity';
import { WhatToDo } from 'src/entities/WhatToDo.entity';
import { WhatToDoHistory } from 'src/entities/WhatToDoHistory.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class WhattodoService {
	constructor(
		@InjectRepository(WhatToDo)
		private readonly wtd: Repository<WhatToDo>,
		@InjectRepository(Member)
		private readonly member: Repository<Member>,
		@InjectRepository(WhatToDoHistory)
		private readonly wtdHistory: Repository<WhatToDoHistory>,
		@InjectRepository(MemberTicketHistory)
		private readonly ticketHistory: Repository<MemberTicketHistory>,

		private dataSource: DataSource
	) {}

	// 오늘 뭐하지 ?
	async whatToDo(params: { memberIdx: number; type: number; regIp: string }): Promise<any> {
		return await transaction(this.dataSource, async (con: any) => {
			let useType = null;
			const countType = {
				0: 'freeCount',
				1: 'paidCount',
			};
			// 회원 조회
			const member = await selectQuery(() =>
				con.getRepository(Member).findOne({ where: { memberIdx: params.memberIdx } })
			);
			if (!member) {
				throw new BadRequestException('회원정보가 없습니다.');
			}

			// 유료 무료 티켓 차감
			if (member.paidCount == 0 && member.freeCount > 0) {
				// use
				useType = 0;
				this.member.update(params.memberIdx, { freeCount: () => 'freeCount - 1' });
			} else if (member.paidCount > 0) {
				//use
				useType = 1;
				this.member.update(params.memberIdx, { paidCount: () => 'paidCount - 1' });
			} else {
				throw new BadRequestException('티켓이 없습니다.');
			}

			// 티켓 이력
			const ticket = await this.ticketHistory.save({
				memberIdx: params.memberIdx,
				useCount: 1,
				beforeCount: member[countType[useType]],
				afterCount: member[countType[useType]] - 1,
				type: useType,
				regDate: Number(getNow()),
				regIp: params.regIp,
			});
			if (!ticket) {
				throw new BadRequestException('티켓차감 실패');
			}

			// 뽑기
			const wtdCnt = await this.wtd.count();
			const wtdPick = this.wtd
				.createQueryBuilder()
				.select(['wtdIdx', 'result', `SUM(percent+(favorite/${wtdCnt})) OVER (ORDER BY rand()) as percent`])
				.where({ useYn: 1 });
			const wtdSub = this.dataSource
				.createQueryBuilder()
				.select(['wtdIdx', 'result'])
				.from(`(${wtdPick.getQuery()})`, 'A')
				.where(`percent >=${Math.random() * 100}`);
			const last = await selectQuery(() =>
				con
					.getRepository(WhatToDoHistory)
					.findOne({ where: { memberIdx: params.memberIdx }, order: { wtd: 'DESC' } })
			);
			if (last) {
				wtdSub.andWhere(`wtdIdx<>${last.wtdIdx}`);
			}

			// 결과 및 뽑기이력
			const result = await wtdSub.getRawOne();
			const history = this.wtdHistory.save({
				wtdIdx: result.wtdIdx,
				result: result.result,
				useYn: 1,
				regDate: Number(getNow()),
				regIp: params.regIp,
			});
			if (!history) {
				throw new BadRequestException('뽑기 실패');
			}
			return result;
		});
	}
}

