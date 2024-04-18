import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Member } from './Member.entity';

// 티켓 이력
@Entity('MemberTicketHistory')
export class MemberTicketHistory {
	@PrimaryGeneratedColumn({ type: 'int' })
	mthIdx: number;

	@Column()
	memberIdx: number;

	// 사용 및 획득 티켓
	@Column()
	useCount: number;

	// 이전 갯수
	@Column()
	beforeCount: number;

	// 이후 갯수
	@Column()
	afterCount: number;

	// 유료1 무료0 타입
	@Column()
	type: number;

	// 등록 일시
	@Column({ type: 'bigint' })
	regDate: number;

	// 등록아이피
	@Column()
	regIp: string;
}

