import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Member } from './Member.entity';

// 호칭
@Entity('MemberCrown')
export class MemberCrown {
	@PrimaryGeneratedColumn({ type: 'int' })
	mcIdx: number;

	// 회원 일련번호
	@ManyToOne(() => Member)
	memberIdx: number;

	// 호칭
	@Column()
	crown: string;

	// 사용여부
	@Column()
	useYn: string;

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

