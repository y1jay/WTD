import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { WhatToDo } from './WhatToDo.entity';

// 뭐하지 뭐먹지 이력
@Entity('WhatToDoHistory')
@Index('memberIdx')
export class WhatToDoHistory {
	@PrimaryGeneratedColumn({ type: 'int' })
	wtdHistoryIdx: number;

	@Column()
	wtdIdx: number;

	@Column()
	memberIdx: number;

	@Column()
	result: string;

	@Column({ type: 'tinyint' })
	useYn: number;

	@Column({ type: 'bigint' })
	regDate: number;

	@Column()
	regIp: string;
}

