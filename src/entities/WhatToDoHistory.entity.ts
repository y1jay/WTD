import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { WhatToDo } from './WhatToDo.entity';

// 뭐하지 뭐먹지 이력
@Entity('WhatToDoHistory')
export class WhatToDoHistory {
	@PrimaryGeneratedColumn({ type: 'int' })
	wtdHistoryIdx: number;

	@Column()
	wtdIdx: number;

	@Column()
	result: string;

	@Column({ type: 'tinyint' })
	useYn: number;

	@Column({ type: 'bigint' })
	regDate: number;

	@Column()
	regIp: string;
}

