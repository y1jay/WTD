import { Column, Entity, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { MemberCrown } from './MemberCrown.entity';

@Entity('member')
export class Member {
	@PrimaryGeneratedColumn({ type: 'int' })
	memberIdx: number;

	// 아이디
	@Column()
	id: string;

	// 비밀번호
	@Column()
	pw: string;

	// 닉네임
	@Column()
	nick: string;

	// 상태코드
	@Column({ type: 'int' })
	stateCode: number;

	// 가입경로
	@Column()
	joinType: string;

	// 디바이스 유니크키(중복로그인 방지)
	@Column()
	deviceUuid: string;

	// 프로필 이미지 경로
	@Column()
	profileImage: string;

	// 무료갯수
	@Column()
	freeCount: number;

	// 유료갯수
	@Column()
	paidCount: number;

	// 등록일시
	@Column({ type: 'bigint' })
	joinDate: number;

	// 등록ip
	@Column()
	joinIp: string;

	// 탈퇴일시
	@Column({ type: 'bigint' })
	leaveDate: number;

	// 탈퇴ip
	@Column()
	leaveIp: string;

	@JoinColumn({ name: 'memberIdx' })
	mcIdx: MemberCrown;
}

