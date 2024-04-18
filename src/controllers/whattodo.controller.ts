import { Body, Controller, Ip, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequiredValidationPipe } from 'src/pipes/custom.pipe';
import { WhattodoService } from 'src/services/whattodo.service';

@Controller('whattodo')
@ApiTags('뽑기')
export class WhattodoController {
	constructor(private readonly wtdService: WhattodoService) {}
	@Post('signOut')
	@ApiOperation({ summary: '회원탈퇴' })
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				memberIdx: { example: '회원일련번호' },
				type: { example: '뭐하나:0 뭐먹지:1 타입' },
			},
		},
	})
	async signOut(
		@Body('memberIdx', RequiredValidationPipe) memberIdx: number,
		@Body('type') type: number,
		@Ip() regIp: string
	): Promise<any> {
		return this.wtdService.whatToDo({
			memberIdx,
			type,
			regIp,
		});
	}
}

