import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Member } from './Member.entity';

// 호칭
@Entity('MemberCrown')
@Index('memberIdx')
@Index('cIdx')
export class MemberCrown {
	@PrimaryGeneratedColumn({ type: 'int' })
	mcIdx: number;

	// 회원 일련번호
	@Column()
	memberIdx: number;

	// 호칭테이블
	@Column()
	cIdx: number;

	// 사용여부
	@Column({ type: 'tinyint' })
	useYn: number;

	// 북마크 여부
	@Column({ type: 'tinyint' })
	bookMark: number;

	// 등록 일시
	@Column({ type: 'bigint' })
	regDate: number;

	// 등록아이피
	@Column()
	regIp: string;
}

