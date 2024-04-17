import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import dayjs = require('dayjs');

@Injectable()
export class RequiredValidationPipe implements PipeTransform {
	async transform(value: any, metadata: ArgumentMetadata) {
		if (!value) {
			throw new BadRequestException(metadata?.data, '필수 항목입니다.');
		}

		return value;
	}
}

export class IsNotEmptyPipe implements PipeTransform {
	async transform(value: any, metadata: ArgumentMetadata) {
		if (value !== undefined) {
			if (typeof value !== 'string') {
				throw new BadRequestException(`${metadata?.data} 매개변수 형식은 문자열 입니다.`);
			} else if (value.trim() === '') {
				throw new BadRequestException(`${metadata.data} 매개변수가 비어있습니다.`);
			}
		}

		return value;
	}
}

export class ParseNotEmptyPipe implements PipeTransform {
	async transform(value: any, metadata: ArgumentMetadata) {
		if (typeof value !== 'string') {
			throw new BadRequestException(`${metadata?.data} 매개변수 형식은 문자열 입니다.`);
		}

		if (value.trim() === '') {
			throw new BadRequestException(`${metadata.data} 매개변수가 비어있습니다.`);
		}

		return value;
	}
}

@Injectable()
export class OptionalValidationPipe implements PipeTransform {
	async transform(value: any, metadata: ArgumentMetadata) {
		const { metatype } = metadata;
		const types = {
			string: String,
			boolean: Boolean,
			number: Number,
			array: Array,
			object: Object,
		};
		const type = Object.keys(types).find((key) => types[key] === metatype);

		if (value !== undefined && typeof value !== type) {
			throw new BadRequestException(`${metadata?.data} 매개변수 형식은 ${type} 입니다.`);
		}

		return value;
	}
}

@Injectable()
export class DateValidationPipe implements PipeTransform {
	constructor(private readonly userValue: string, private readonly required: boolean = false) {}

	transform(value: string, metadata: ArgumentMetadata) {
		if (this.required === false && value === undefined) return;
		if (!dayjs(value, this.userValue, true).isValid()) {
			throw new BadRequestException(`${metadata?.data} 매개변수 형식은 ${this.userValue} 입니다.`);
		}

		return value;
	}
}

@Injectable()
export class EnumValidationPipe implements PipeTransform {
	constructor(private readonly userValue: any, private readonly required: boolean = false) {}

	transform(value: string, metadata: ArgumentMetadata) {
		if (this.required === false && value === undefined) return;
		if (!this.userValue.includes(value)) {
			throw new BadRequestException(`${metadata?.data} 매개변수 형식은 ${this.userValue} 입니다.`);
		}

		return value;
	}
}

@Injectable()
export class SeparatorValidationPipe implements PipeTransform {
	constructor(private readonly userValue: any, private readonly required: boolean = false) {}

	transform(value: string, metadata: ArgumentMetadata) {
		if (this.required === false && value === undefined) return;

		return value.split(this.userValue);
	}
}

@Injectable()
export class PhoneValidationPipe implements PipeTransform {
	constructor(private readonly userValue: any = '', private readonly required: boolean = false) {}

	transform(value: string, metadata: ArgumentMetadata) {
		if (this.required === false && value === undefined) return;

		let regex = /^01([0|1|6|7|8|9])([0-9]{3,4})([0-9]{4})$/;

		if (this.userValue === '-') {
			regex = /^01([0|1|6|7|8|9])-([0-9]{3,4})-([0-9]{4})$/;
		}

		if (regex.test(value) === false) {
			throw new BadRequestException(
				`${metadata?.data} 매개변수 형식은 01[0|1|6|7|8|9]${this.userValue}[0-9]{3,4}${this.userValue}[0-9]{4} 입니다.`
			);
		}

		return value;
	}
}

export class BooleanNumberPipe implements PipeTransform {
	async transform(value: any, metadata: ArgumentMetadata) {
		if (value != undefined && value != '0' && value != '1') {
			throw new BadRequestException(`${metadata?.data} 매개변수 형식은 0 or 1 입니다.`);
		}

		return value;
	}
}

export class AdminPipe implements PipeTransform {
	async transform(value: any, metadata: ArgumentMetadata) {
		// if (value != undefined && value != '0' && value != '1') {
		// 	throw new BadRequestException(`${metadata?.data} 매개변수 형식은 0 or 1 입니다.`);
		// }

		return value['user'];
	}
}

