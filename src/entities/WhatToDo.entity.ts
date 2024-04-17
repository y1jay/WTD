import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// 뭐하지 뭐먹지
@Entity('WhatToDo')
export class WhatToDo {
	@PrimaryGeneratedColumn({ type: 'int' })
	wtdIdx: number;

	// 카테고리
	@Column()
	category: string;

	// 결과
	@Column()
	result: string;

	// 좋아요
	@Column()
	favorite: number;

	// // 링크연동
	// @Column()
	// link: number;

	// 타겟
	@Column()
	target: number;

	// 퍼센트
	@Column({ type: 'float' })
	percent: number;

	// 사용여부
	@Column({ type: 'tinyint' })
	useYn: number;

	// 등록일
	@Column({ type: 'bigint' })
	regDate: number;

	// 등록아이피
	@Column()
	regIp: string;
}

