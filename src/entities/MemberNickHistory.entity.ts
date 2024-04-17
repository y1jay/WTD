import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Member } from './Member.entity';

@Entity('MemberNickHistory')
export class MemberNickHistory {
	@PrimaryGeneratedColumn({ type: 'int' })
	mnhIdx: number;

	@ManyToOne(() => Member)
	memberIdx: number;

	// 이전 닉네임
	@Column()
	beforeNick: string;

	// 이후 닉네임
	@Column()
	afterNick: string;

	// 사용여부
	@Column()
	useYn: string;

	// 등록일시
	@Column({ type: 'bigint' })
	regDate: string;

	// 등록ip
	@Column()
	regIp: string;

	// 변경타입
	@Column()
	changeType: string;

	// 부가설명
	@Column()
	comment: string;
}

