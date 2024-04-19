import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Member } from './Member.entity';

@Entity('MemberLoginHistory')
export class MemberLoginHistory {
	@PrimaryGeneratedColumn({ type: 'int' })
	mlhIdx: number;

	// 일련번호
	@Column()
	memberIdx: number;

	// 탈퇴일시
	@Column({ type: 'bigint' })
	loginDate: number;

	// 탈퇴ip
	@Column()
	loginIp: string;
}

